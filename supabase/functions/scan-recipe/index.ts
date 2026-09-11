// Supabase Edge Function: scan-recipe
//
// Reads a recipe out of either a photo or a URL and returns structured recipe
// JSON shaped to match the add-recipe form. A photo arrives as base64 and goes
// straight to Gemini; a URL is fetched and distilled here first (see page.ts)
// so the model reads the recipe rather than the website around it.
//
// The Gemini API key lives only in this function's environment (set it as the
// GEMINI_API_KEY secret in the Supabase dashboard) — it is never shipped to the
// browser. Callers must be signed in AND present in the `admins` table.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { distillPage, PageError } from './page.ts';
import { buildImagePrompt, buildPagePrompt } from './prompt.ts';

const GEMINI_MODEL = 'gemini-3.6-flash';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/** Raised where the caller is at fault and the message is meant for them. */
class RequestError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = 'RequestError';
  }
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

/**
 * Sends the parts to Gemini and returns the recipe object it answers with.
 *
 * The key goes in a header rather than the query string so it can never surface
 * in an error message, log line, or stack trace.
 */
async function askGemini(parts: GeminiPart[], apiKey: string): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error('Gemini API error:', response.status, detail);
    // Surface Gemini's own reason: a retired model, a rejected key and a
    // tripped quota are indistinguishable without it.
    throw new RequestError(
      `Gemini rejected the request (${response.status}): ${detail.slice(0, 400)}`,
      502
    );
  }

  const result = await response.json();
  const rawText: string | undefined = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error('Unexpected Gemini response shape:', JSON.stringify(result));
    throw new RequestError('Could not read a recipe from that.', 422);
  }

  // Strip any accidental markdown fences before parsing
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/g, '')
    .trim();

  let recipe: unknown;
  try {
    recipe = JSON.parse(cleaned);
  } catch {
    console.error('Gemini returned non-JSON:', cleaned.slice(0, 500));
    throw new RequestError('Could not read a recipe from that.', 422);
  }

  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
    console.error('Gemini returned a non-object:', cleaned.slice(0, 500));
    throw new RequestError('Could not read a recipe from that.', 422);
  }

  return recipe as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      console.error('GEMINI_API_KEY secret is not set');
      return json({ error: 'Server is not configured for recipe scanning.' }, 500);
    }

    // ── Auth: caller must be signed in ────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Not authenticated' }, 401);
    }

    // ── Auth: caller must be an admin ─────────────────────────────────────────
    // Row-level security on `admins` means a non-admin simply sees zero rows,
    // mirroring the client-side checkAdminStatus() logic.
    const { data: admins, error: adminError } = await supabase.from('admins').select('*');
    if (adminError || !admins || admins.length === 0) {
      return json({ error: 'Not authorized' }, 403);
    }

    // ── Payload ───────────────────────────────────────────────────────────────
    const { image, mimeType, url } = await req.json();

    // A URL import knows two things the model is not asked for: where the
    // recipe came from, and which photo the page shows. Both are handed to the
    // form alongside what Gemini read.
    if (typeof url === 'string' && url.trim()) {
      const page = await distillPage(url);
      const recipe = await askGemini([{ text: buildPagePrompt(page) }], geminiKey);
      return json({ ...recipe, link: page.sourceUrl, image_path: page.imageUrl });
    }

    if (typeof image === 'string' && image) {
      const recipe = await askGemini([
        { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } },
        { text: buildImagePrompt() }
      ], geminiKey);
      return json(recipe);
    }

    return json({ error: 'Send either an image or a url to read a recipe from.' }, 400);

  } catch (err) {
    if (err instanceof PageError || err instanceof RequestError) {
      return json({ error: err.message }, err.status);
    }

    console.error('scan-recipe failed:', err);
    // Callers are verified admins and the API key is never in the URL, so the
    // real message is safe to return — and saves a trip to the function logs.
    const detail = err instanceof Error ? err.message : String(err);
    return json({ error: `Scan failed: ${detail}` }, 500);
  }
});
