import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'ingredientSanitizer'})

export class IngredientSanitizerPipe implements PipeTransform{

  transform(incomingString: string, incomingQuantity:number){

    let outgoingString: string = incomingString;

    if (incomingQuantity <= 1){
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
