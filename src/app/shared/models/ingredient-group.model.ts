import { Ingredient } from "./ingredient.model";

export class IngredientGroup{
  constructor(
    public ingredientGroupName: string,
    public ingredients: Ingredient[]
  ){}
}
