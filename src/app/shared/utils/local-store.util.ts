/**
 * Reading and writing localStorage without letting it take the page down.
 *
 * Every accessor here is wrapped, because localStorage is not always there to
 * be used: Safari's private mode throws on write once the quota is reached,
 * browsers set to block site data throw on the very first property access, and
 * a value written by an older version of the app can be JSON that no longer
 * parses into what the caller expects.
 *
 * None of what we keep in here is precious — a checked-off step, a favourite,
 * the recipes someone looked at. Losing it should look like a fresh visit, not
 * like a broken page, so every failure resolves to the caller's fallback.
 */

export function readJson<T>(key: string, fallback: T): T {
  try{
    const raw = localStorage.getItem(key);
    if(raw === null){
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed as T;
  }catch{
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try{
    localStorage.setItem(key, JSON.stringify(value));
  }catch{
    // Full, blocked, or unavailable. The in-memory state carries the session.
  }
}

export function removeKey(key: string): void {
  try{
    localStorage.removeItem(key);
  }catch{
    // As above.
  }
}

/**
 * The string array behind a key, with anything that is not a string dropped.
 *
 * Favourites and recently-viewed are both lists of slugs, and both are read
 * straight into a template. A stray number or null in the stored JSON would
 * otherwise reach the page.
 */
export function readStringArray(key: string): string[] {
  const value = readJson<unknown>(key, []);
  if(!Array.isArray(value)){
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === 'string');
}
