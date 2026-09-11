// Turning a recipe URL into something a model can read.
//
// A recipe page arrives as a megabyte of navigation, adverts, comments and
// twelve other recipes. The part worth reading is usually a small, precisely
// structured island inside it: most recipe sites publish schema.org Recipe
// JSON-LD for search engines. When that is there we hand the model the island;
// when it is not, we strip the page to text and hand over that instead.

const MAX_HTML_BYTES = 2_000_000;
// Generous, because recipe blogs bury the recipe under the story of the
// holiday where it was first eaten — a tight cap cuts the page off above the
// only part worth reading.
const MAX_TEXT_CHARS = 60_000;
const FETCH_TIMEOUT_MS = 15_000;

// A bare fetch collects a 403 from a good number of recipe sites — they serve
// pages to browsers, not to scripts.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** An error whose message is safe — and useful — to show the person importing. */
export class PageError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = 'PageError';
  }
}

export interface DistilledPage {
  /** What the model reads: the page's own recipe data, or the page as text. */
  content: string;
  format: 'json-ld' | 'text';
  /** Absolute URL of the recipe's photo, or '' when the page offers none. */
  imageUrl: string;
  /** The URL actually landed on, after any redirects. */
  sourceUrl: string;
}

// ── URL validation ───────────────────────────────────────────────────────────

// Callers are verified admins, but this function runs inside Supabase's network
// with its own credentials in the environment. Refusing to fetch addresses that
// only exist in there costs a few lines and closes the door on using the
// importer as a way into it.
function isPrivateAddress(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host === '::1' || host === '::') return true;
  if (/^f[cd][0-9a-f]{2}:/.test(host)) return true; // unique-local
  if (/^fe[89ab][0-9a-f]:/.test(host)) return true; // link-local

  const octets = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!octets) return false;

  const a = Number(octets[1]);
  const b = Number(octets[2]);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) ||           // link-local, incl. cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

/** Normalises what someone pasted into a URL we are willing to fetch. */
export function parseRecipeUrl(raw: unknown): URL {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (!trimmed) throw new PageError('Paste a link to the recipe first.');

  let url: URL;
  try {
    // People paste "allrecipes.com/..." as often as they paste the scheme.
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new PageError('That does not look like a web address.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new PageError('Only http and https links can be imported.');
  }
  if (isPrivateAddress(url.hostname)) {
    throw new PageError('That address is not one the importer can reach.');
  }
  return url;
}

// ── Fetching ─────────────────────────────────────────────────────────────────

/** Reads a response body up to the byte cap, then drops the connection. */
async function readCapped(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});

  const out = new Uint8Array(Math.min(total, MAX_HTML_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= out.length) break;
    out.set(chunk.subarray(0, out.length - offset), offset);
    offset += chunk.length;
  }
  return out;
}

async function fetchPage(url: URL): Promise<{ html: string; finalUrl: URL }> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new PageError(`Could not open that link: ${detail}`, 502);
  }

  // A redirect can land somewhere the original hostname was standing in for.
  const finalUrl = new URL(response.url || url.toString());
  if (isPrivateAddress(finalUrl.hostname)) {
    await response.body?.cancel().catch(() => {});
    throw new PageError('That link redirects somewhere the importer will not follow.');
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new PageError(
      response.status === 401 || response.status === 403
        ? 'That site would not let the importer read the page. Try the photo scanner instead.'
        : `The site returned ${response.status} for that link.`,
      502
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType && !/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
    await response.body?.cancel().catch(() => {});
    throw new PageError('That link points at a file, not a recipe page.');
  }

  return { html: new TextDecoder('utf-8').decode(await readCapped(response)), finalUrl };
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  deg: '°', frac12: '½', frac13: '⅓', frac14: '¼', frac34: '¾'
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const code = /^#x/i.test(body)
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Content of the first `<meta>` tag carrying the given property or name. */
function metaContent(html: string, key: string): string | null {
  const tag = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i')
  )?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decodeEntities(content) : null;
}

/** The page with its furniture removed and its tags flattened to line breaks. */
export function htmlToText(html: string): string {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  return decodeEntities(stripped)
    .replace(/[ \t\u00a0]+/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

// ── schema.org JSON-LD ───────────────────────────────────────────────────────

type LdNode = Record<string, unknown>;

// Reviews and comments are the bulk of a big recipe node and none of its
// substance; dropping them keeps the prompt small and the model on topic.
const LD_NOISE = new Set([
  '@context', '@id', 'review', 'reviews', 'comment', 'comments',
  'aggregateRating', 'video', 'publisher', 'mainEntityOfPage', 'isPartOf',
  'breadcrumb', 'potentialAction', 'interactionStatistic', 'thumbnailUrl'
]);

function flattenLd(node: unknown, out: LdNode[]): void {
  if (Array.isArray(node)) {
    for (const item of node) flattenLd(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;

  const obj = node as LdNode;
  out.push(obj);
  if (obj['@graph']) flattenLd(obj['@graph'], out);
}

function isRecipeNode(node: LdNode): boolean {
  const type = node['@type'];
  const types = Array.isArray(type) ? type : [type];
  return types.some(t => typeof t === 'string' && t.toLowerCase() === 'recipe');
}

/** Every JSON-LD node on the page, flattened out of its blocks and @graphs. */
function collectLdNodes(html: string): LdNode[] {
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  const nodes: LdNode[] = [];
  for (const block of blocks) {
    const body = block[1].trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      // A few CMSes entity-escape the block on the way out.
      try {
        parsed = JSON.parse(decodeEntities(body));
      } catch {
        continue;
      }
    }
    flattenLd(parsed, nodes);
  }
  return nodes;
}

/**
 * Replaces a bare `{"@id": "..."}` with the node it points at.
 *
 * Yoast and the WordPress recipe plugins publish a whole page as one @graph
 * whose nodes cross-reference each other by id, so a recipe's author routinely
 * arrives as a pointer to a Person sitting elsewhere in that graph. Left alone
 * it reaches the model as an opaque hash where a name should be.
 */
function resolveRefs(value: unknown, byId: Map<string, LdNode>, depth: number): unknown {
  if (Array.isArray(value)) return value.map(item => resolveRefs(item, byId, depth));
  if (!value || typeof value !== 'object') return value;

  const node = value as LdNode;
  const keys = Object.keys(node);

  if (keys.length === 1 && keys[0] === '@id' && typeof node['@id'] === 'string') {
    const target = depth < 3 ? byId.get(node['@id']) : undefined;
    // Pruning on the way in drops the target's own @id, so a graph that
    // references back the way it came cannot walk in circles.
    return target ? resolveRefs(pruneNoise(target), byId, depth + 1) : value;
  }

  const resolved: LdNode = {};
  for (const [key, item] of Object.entries(node)) {
    resolved[key] = resolveRefs(item, byId, depth);
  }
  return resolved;
}

/** The page's own schema.org Recipe node, if it publishes one. */
export function findRecipeLd(html: string): LdNode | null {
  const nodes = collectLdNodes(html);
  const recipe = nodes.find(isRecipeNode);
  if (!recipe) return null;

  const byId = new Map<string, LdNode>();
  for (const node of nodes) {
    const id = node['@id'];
    if (typeof id === 'string' && !byId.has(id)) byId.set(id, node);
  }

  // Pruned before resolving, so the references hanging off the noise keys are
  // never followed in the first place.
  return resolveRefs(pruneNoise(recipe), byId, 0) as LdNode;
}

/**
 * Decodes HTML entities in every string the node carries. Publishers routinely
 * escape their JSON-LD as though it were markup, so "it&#39;s" arrives where
 * "it's" was meant — and it would go into the form exactly that way.
 *
 * Done value by value rather than across the serialised JSON: an entity that
 * decodes to a quote or a backslash would corrupt the document in place.
 */
function decodeLdStrings(value: unknown): unknown {
  if (typeof value === 'string') return decodeEntities(value);
  if (Array.isArray(value)) return value.map(decodeLdStrings);
  if (value && typeof value === 'object') {
    const decoded: LdNode = {};
    for (const [key, item] of Object.entries(value as LdNode)) {
      decoded[key] = decodeLdStrings(item);
    }
    return decoded;
  }
  return value;
}

function pruneNoise(node: LdNode): LdNode {
  const pruned: LdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (LD_NOISE.has(key)) continue;
    pruned[key] = value;
  }
  return pruned;
}

function pruneLd(node: LdNode): LdNode {
  const pruned = pruneNoise(node);
  for (const key of Object.keys(pruned)) {
    pruned[key] = decodeLdStrings(pruned[key]);
  }
  return pruned;
}

/** First usable image URL from a JSON-LD value of any of its allowed shapes. */
function pickImage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickImage(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const obj = value as LdNode;
    return pickImage(obj.url) ?? pickImage(obj.contentUrl);
  }
  return null;
}

/**
 * The recipe's photo, resolved against the page it came from.
 *
 * Read here rather than asked of the model: a URL is the one field it has no
 * way to check and every reason to guess at.
 */
function extractImageUrl(html: string, recipe: LdNode | null, base: URL): string {
  const candidate =
    pickImage(recipe?.image) ??
    metaContent(html, 'og:image') ??
    metaContent(html, 'twitter:image');
  if (!candidate) return '';

  try {
    const resolved = new URL(candidate, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? resolved.toString()
      : '';
  } catch {
    return '';
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function distillPage(rawUrl: unknown): Promise<DistilledPage> {
  const { html, finalUrl } = await fetchPage(parseRecipeUrl(rawUrl));

  const recipe = findRecipeLd(html);
  const imageUrl = extractImageUrl(html, recipe, finalUrl);
  const sourceUrl = finalUrl.toString();

  if (recipe) {
    return { content: JSON.stringify(pruneLd(recipe)), format: 'json-ld', imageUrl, sourceUrl };
  }

  const text = htmlToText(html);
  if (text.length < 200) {
    throw new PageError(
      'There was not enough on that page to read a recipe from. It may need JavaScript to load.',
      422
    );
  }
  return { content: text, format: 'text', imageUrl, sourceUrl };
}
