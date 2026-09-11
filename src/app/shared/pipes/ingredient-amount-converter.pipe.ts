import { Pipe, PipeTransform } from "@angular/core";
import { toAmountParts } from "../utils/ingredient-amount.util";

// The flat form of an amount: 0.67 as "2/3", 1.5 as "1 1/2".
//
// The maths lives in ingredient-amount.util so that this and the stacked
// fraction <app-ingredient-amount> renders cannot drift into disagreeing about
// what a number says. Reach for this where only plain text will do — a title
// attribute, a label, a string being built up — and for the ingredients
// themselves reach for the component, which spaces the whole number and the
// fraction apart so "1 1/2" cannot be read as "11/2".
@Pipe({
    name: 'ingredientAmountConverter',
    standalone: false
})

export class IngredientAmountConverterPipe implements PipeTransform{

  transform(incomingQuantity: number | string | null | undefined, doubled: boolean = false): string {
    return toAmountParts(incomingQuantity, doubled).text;
  }

}
