import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'ingredientAmountConverter'})

export class IngredientAmountConverterPipe implements PipeTransform{

  quantityAdjustments = {
    ".25": " 1/4",
    ".33": " 1/3",
    ".5": " 1/2",
    ".66": " 2/3",
    ".75": " 3/4",
    "0.25": "1/4",
    "0.33": "1/3",
    "0.5": "1/2",
    "0.66": "2/3",
    "0.75": "3/4"
  }

  transform(incomingQuantity: number, doubled: boolean) {

    if(doubled){
      incomingQuantity = incomingQuantity * 2;
    }

    let stringQuantity = incomingQuantity.toString().replace(/0.25|0.33|0.5|0.66|0.75|.25|.33|.5|.66|.75/, matched => this.quantityAdjustments[matched]);

    return stringQuantity;
  }

}
