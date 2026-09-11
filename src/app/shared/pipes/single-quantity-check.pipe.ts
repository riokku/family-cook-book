import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'ingredientSanitizer',
    standalone: false
})

export class IngredientSanitizerPipe implements PipeTransform{

  // doubled has to be passed here as well as to ingredientAmountConverter, and
  // for the same reason: the unit is plural or not according to the number
  // printed beside it, which is the doubled one when the page is doubled.
  // Reading the stored amount alone put "2 cup" on screen for every ingredient
  // measured in a single one.
  transform(incomingString: string, incomingQuantity: number, doubled: boolean = false){

    let outgoingString: string = incomingString;

    const quantity = doubled ? incomingQuantity * 2 : incomingQuantity;

    if (quantity <= 1){
      let lastLetter = incomingString.charAt(incomingString.length -1);
      if(lastLetter === 's'){
        outgoingString = incomingString.slice(0, -1);
      }
    }

    switch(outgoingString){
      case "Teaspoons":
      case "Teaspoon":
        return outgoingString + " (tsp)";
      case "Tablespoons":
      case "Tablespoon":
        return outgoingString + " (tbsp)";
      case "Fluid ounces":
      case "Fluid ounce":
        return outgoingString + " (fl oz)";
      case "Pints":
      case "Pint":
        return outgoingString + " (pt)";
      case "Quarts":
      case "Quart":
        return outgoingString + " (qt)";
      case "Milliliters":
      case "Milliliter":
        return outgoingString + " (ml)";
      case "Liters":
      case "Liter":
        return outgoingString + " (l)";
      case "Grams":
      case "Gram":
        return outgoingString + " (g)";
      case "Kilograms":
      case "Kilogram":
        return outgoingString + " (kg)";
      case "Ounces":
      case "Ounce":
        return outgoingString + " (oz)";
      case "Pounds":
      case "Pound":
        return outgoingString + " (lb)";
      default:
        return outgoingString;
    }

  }

}
