// Supabase Edge Function: scan-recipe
//
// Accepts a base64-encoded photo of a recipe, sends it to the Gemini API, and
// returns structured recipe JSON shaped to match the add-recipe form.
//
// The Gemini API key lives only in this function's environment (set it as the
// GEMINI_API_KEY secret in the Supabase dashboard) — it is never shipped to the
// browser. Callers must be signed in AND present in the `admins` table.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-2.0-flash';

const VALID_UNITS = [
  'Cups', 'Teaspoons', 'Tablespoons', 'Fluid ounces', 'Pints',
  'Quarts', 'Milliliters', 'Liters', 'Grams', 'Kilograms',
  'Ounces', 'Pounds', 'Count'
];

const VALID_TAGS = [
  'Appetizer', 'Dinner', 'Cast iron', 'Beverage', 'Breakfast',
  'Dessert', 'Cookies', 'Grilling', 'Italian', 'Mexican',
  'Salad', 'Seafood', 'Soup'
];

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

function buildPrompt(): string {
  return `You are a recipe extraction assistant. Analyze this recipe image and extract all information into a structured JSON object.

Return ONLY a valid JSON object — no markdown, no code fences, no explanation — with exactly this structure:
{
  "name": "recipe name",
  "description": "a brief 1-2 sentence description of the dish",
  "author": "author or source if visible, otherwise empty string",
  "prep_time": <number in minutes, or null>,
  "cook_time": <number in minutes, or null>,
  "chill_time": <number in minutes, or null>,
  "total_time": <number in minutes, or null>,
  "serving_size": <number, or null>,
  "ingredient_groups": [
    {
      "ingredientGroupName": "group label (use 'Main' if there is no group label)",
      "ingredients": [
        {
          "ingredientName": "ingredient name",
          "ingredientAmount": <number>,
          "ingredientMeasurementType": "<one value from the allowed units list>"
        }
      ]
    }
  ],
  "steps": [
    { "step": "full step text", "stepIngredients": [] }
  ],
  "tags": ["tag1"],
  "notes": "any tips or notes from the recipe, or empty string"
}

Rules:
- ingredientMeasurementType MUST be exactly one of: ${VALID_UNITS.join(', ')}
- Use "Count" for whole items without a unit (e.g. 2 eggs, 3 cloves of garlic)
- tags MUST only contain values from: ${VALID_TAGS.join(', ')}
- All times must be plain integers in minutes
- If a value is not visible or not applicable, use null for numbers and "" for strings
- If the recipe has distinct ingredient sections (e.g. "Sauce", "Dough"), create one group per section`;
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
    const { image, mimeType } = await req.json();
    if (!image || typeof image !== 'string') {
      return json({ error: 'Missing image data' }, 400);
    }

    // ── Gemini ────────────────────────────────────────────────────────────────
    // The key goes in a header rather than the query string so it can never
    // surface in an error message, log line, or stack trace.
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } },
              { text: buildPrompt() }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, detail);
      return json({ error: 'The recipe scanner is unavailable right now.' }, 502);
    }

    const result = await geminiResponse.json();
    const rawText: string | undefined = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(result));
      return json({ error: 'Could not read a recipe from that photo.' }, 422);
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
      return json({ error: 'Could not read a recipe from that photo.' }, 422);
    }

    return json(recipe);

  } catch (err) {
    console.error('scan-recipe failed:', err);
    // Callers are verified admins and the API key is never in the URL, so the
    // real message is safe to return — and saves a trip to the function logs.
    const detail = err instanceof Error ? err.message : String(err);
    return json({ error: `Scan failed: ${detail}` }, 500);
  }
});
