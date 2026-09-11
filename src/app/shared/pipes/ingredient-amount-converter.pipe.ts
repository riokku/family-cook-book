import { Pipe, PipeTransform } from "@angular/core";

// Shows a stored decimal amount the way a cook would write it: 0.67 as 2/3,
// 0.25 as 1/4, 1.5 as 1 1/2.
//
// This used to be a regex over the number's own text, swapping matched runs out
// of a lookup table. Reading a number as a string meant it only ever recognised
// the handful of decimals someone had thought to list, and the dots in the
// pattern were unescaped — so they matched any character, not a decimal point:
//
//   0.67   ->  "0.67"           the value the form writes for 2/3, unhandled
//   10.5   ->  "11/2"           "0.5" was found inside "10.5" and swapped out
//   0.375  ->  "0.undefined"    ".75" matched the "375", and missed the table
//
// Snapping to the nearest fraction instead means any decimal is handled,
// including whatever a doubled amount happens to land on.
@Pipe({
    name: 'ingredientAmountConverter',
    standalone: false
})

export class IngredientAmountConverterPipe implements PipeTransform{

  // The denominators a kitchen actually measures in: halves, thirds, quarters,
  // sixths and eighths. Listed smallest first, so a value that two of them
  // describe equally well is written in the coarser one — 1/2 rather than 4/8.
  private readonly denominators = [2, 3, 4, 6, 8];

  // How far off a fraction a value may sit and still be shown as that fraction.
  // It has to cover the rounded decimals the forms store for the repeating
  // thirds — 0.66 is 1/150 away from 2/3, the widest gap we have to forgive —
  // while staying well inside the 0.042 between neighbours like 5/8 and 2/3.
  private readonly tolerance = 0.02;

  // Widened past number because that is what reaches it: the scanner writes
  // null for an amount a page does not give, and an ingredient can be named in
  // a step without one.
  transform(incomingQuantity: number | string | null | undefined, doubled: boolean = false): string {

    // Guarded before the doubling, because null * 2 is 0 — a missing amount
    // would otherwise render as "0" rather than as nothing at all.
    if(incomingQuantity === null || incomingQuantity === undefined){
      return '';
    }

    if(typeof incomingQuantity === 'string' && incomingQuantity.trim() === ''){
      return '';
    }

    const parsedQuantity = Number(incomingQuantity);
    if(!isFinite(parsedQuantity)){
      return '';
    }

    const quantity = doubled ? parsedQuantity * 2 : parsedQuantity;

    const sign = quantity < 0 ? '-' : '';
    const magnitude = Math.abs(quantity);

    let whole = Math.floor(magnitude);
    const fraction = this.nearestFraction(magnitude - whole);

    // Nothing in the table is close enough, so this is a genuinely awkward
    // amount like 0.6. Showing it to two places keeps it honest and keeps
    // floating point noise (0.1 * 2 * 3 and friends) out of the page.
    if(!fraction){
      return sign + Number(magnitude.toFixed(2)).toString();
    }

    // The remainder rounded up to a whole one, e.g. 0.99 landing on 1/1.
    if(fraction.numerator === fraction.denominator){
      whole += 1;
      return sign + whole;
    }

    if(fraction.numerator === 0){
      return sign + whole;
    }

    const written = fraction.numerator + '/' + fraction.denominator;

    return whole === 0 ? sign + written : sign + whole + ' ' + written;
  }

  // The closest fraction to a value in [0, 1), or null if none of them is
  // within tolerance. A numerator of 0 means it rounded down to the whole
  // below, and one equal to its denominator means it rounded up to the next.
  private nearestFraction(remainder: number): { numerator: number, denominator: number } | null {

    let closest: { numerator: number, denominator: number } | null = null;
    let smallestError = Infinity;

    for(const denominator of this.denominators){
      const numerator = Math.round(remainder * denominator);
      const error = Math.abs(remainder - numerator / denominator);

      // Strictly closer, so an equally good fit in a later, finer denominator
      // never displaces the coarse one it is an expansion of.
      if(error < smallestError){
        smallestError = error;
        closest = { numerator, denominator };
      }
    }

    if(!closest || smallestError > this.tolerance){
      return null;
    }

    return this.reduce(closest);
  }

  private reduce(fraction: { numerator: number, denominator: number }){
    const divisor = this.greatestCommonDivisor(fraction.numerator, fraction.denominator);
    return {
      numerator: fraction.numerator / divisor,
      denominator: fraction.denominator / divisor
    };
  }

  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }

}
