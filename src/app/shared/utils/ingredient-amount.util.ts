/**
 * Turns a stored decimal amount into the fraction a cook would write: 0.67 into
 * two thirds, 1.5 into one and a half.
 *
 * Amounts are arbitrary decimals rather than a known set — the recipe scanner
 * is told to reduce every fraction it reads to one, so 2/3 arrives as whatever
 * the model wrote that day — which is why this snaps to the nearest fraction
 * rather than looking a value up in a table.
 *
 * Returns the pieces rather than one string so a caller can set the numerator
 * and denominator as a real stacked fraction. `text` is the same value written
 * out flat, for a screen reader and for anywhere plain text is all that fits.
 */

export interface AmountParts {
  /** The flat form, e.g. "1 1/2". Empty when there is no amount to show. */
  text: string;
  /** The whole part, or '' when the amount is under one. */
  whole: string;
  /** Null when the amount came out whole, or had no fraction close enough. */
  numerator: number | null;
  denominator: number | null;
}

const EMPTY: AmountParts = { text: '', whole: '', numerator: null, denominator: null };

// The denominators a kitchen measures in: halves, thirds, quarters, sixths and
// eighths. Smallest first, so a value two of them describe equally well is
// written in the coarser one — 1/2 rather than 4/8.
const DENOMINATORS = [2, 3, 4, 6, 8];

// How far off a fraction a value may sit and still be shown as that fraction.
// Wide enough to cover the rounded decimals the forms store for the repeating
// thirds — 0.66 is 1/150 from 2/3, the widest gap to forgive — and well inside
// the 0.042 between neighbours like 5/8 and 2/3.
const TOLERANCE = 0.02;

export function toAmountParts(
  incomingQuantity: number | string | null | undefined,
  scale: number = 1
): AmountParts {

  // Checked before the scaling, because null * 2 is 0 — a missing amount would
  // otherwise come back as "0" rather than as nothing at all.
  if(incomingQuantity === null || incomingQuantity === undefined){
    return EMPTY;
  }

  if(typeof incomingQuantity === 'string' && incomingQuantity.trim() === ''){
    return EMPTY;
  }

  const parsedQuantity = Number(incomingQuantity);
  if(!isFinite(parsedQuantity)){
    return EMPTY;
  }

  // A scale of 0, or one that is not a number at all, would silently blank the
  // whole ingredient list, so anything unusable falls back to the recipe as
  // written rather than to nothing.
  const factor = isFinite(scale) && scale > 0 ? scale : 1;
  const quantity = parsedQuantity * factor;

  const sign = quantity < 0 ? '-' : '';
  const magnitude = Math.abs(quantity);

  let whole = Math.floor(magnitude);
  const fraction = nearestFraction(magnitude - whole);

  // Nothing close enough, so this is a genuinely awkward amount like 0.6.
  // Two places keeps it honest and keeps floating point noise off the page.
  if(!fraction){
    const written = sign + Number(magnitude.toFixed(2)).toString();
    return { text: written, whole: written, numerator: null, denominator: null };
  }

  // The remainder rounded up to a whole one, e.g. 0.99 landing on 1/1.
  if(fraction.numerator === fraction.denominator){
    whole += 1;
    return wholeOnly(sign + whole);
  }

  if(fraction.numerator === 0){
    return wholeOnly(sign + whole);
  }

  const wholeText = whole === 0 ? '' : sign + whole;
  const fractionText = fraction.numerator + '/' + fraction.denominator;

  return {
    text: wholeText === '' ? sign + fractionText : wholeText + ' ' + fractionText,
    whole: wholeText,
    numerator: fraction.numerator,
    denominator: fraction.denominator
  };
}

function wholeOnly(written: string): AmountParts {
  return { text: written, whole: written, numerator: null, denominator: null };
}

// The closest fraction to a value in [0, 1), or null if none is within
// tolerance. A numerator of 0 means it rounded down to the whole below; one
// equal to its denominator means it rounded up to the next.
function nearestFraction(remainder: number): { numerator: number, denominator: number } | null {

  let closest: { numerator: number, denominator: number } | null = null;
  let smallestError = Infinity;

  for(const denominator of DENOMINATORS){
    const numerator = Math.round(remainder * denominator);
    const error = Math.abs(remainder - numerator / denominator);

    // Strictly closer, so an equally good fit in a later, finer denominator
    // never displaces the coarse one it is an expansion of.
    if(error < smallestError){
      smallestError = error;
      closest = { numerator, denominator };
    }
  }

  if(!closest || smallestError > TOLERANCE){
    return null;
  }

  return reduce(closest);
}

function reduce(fraction: { numerator: number, denominator: number }){
  const divisor = greatestCommonDivisor(fraction.numerator, fraction.denominator);
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor
  };
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}
