import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'ingredientAmountConverter'})

export class IngredientAmountConverterPipe implements PipeTransform{

  quantityAdjustments = {
    ".25": " 1/4",
    ".33": " 1/3",
    ".5": " 1/2",
    ".66": " 2/3",
    ".75": " 3/4",
  }

  transform(incomingQuantity: number) {

    let stringQuantity = incomingQuantity.toString().replace(/.25|.33|.5|.66|.75/g, matched => this.quantityAdjustments[matched]);





    return stringQuantity;
  }

}
