import { Injectable } from "@angular/core";
import { Ingredient } from "../models/ingredient.model";
import { Recipe } from "../models/recipe.model";



@Injectable()
export class RecipeService{

  private recipes: Recipe[] = [
    new Recipe(
       "Pizza",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F19%2F2014%2F07%2F10%2Fpepperoni-pizza-ck-x.jpg&q=60",
        [
          new Ingredient("Crust", 1, "Quantity")
        ],
        30,
        6
    ),
    new Recipe(
       "Doughnuts",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "https://idsb.tmgrup.com.tr/ly/uploads/images/2021/06/06/119434.jpeg",
        [
          new Ingredient("Flour", 2, "Cups")
        ],
        45,
        8
    ),
    new Recipe(
       "Salad",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "https://www.acouplecooks.com/wp-content/uploads/2019/05/Chopped-Salad-001_1.jpg",
        [
          new Ingredient("Lettuce", 2, "Heads")
        ],
        15,
        2
    ),
    new Recipe(
      "Pizza2",
       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
       "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F19%2F2014%2F07%2F10%2Fpepperoni-pizza-ck-x.jpg&q=60",
       [
         new Ingredient("Crust", 1, "Quantity")
       ],
       30,
       6
   ),
   new Recipe(
      "Doughnuts2",
       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
       "https://idsb.tmgrup.com.tr/ly/uploads/images/2021/06/06/119434.jpeg",
       [
         new Ingredient("Flour", 2, "Cups")
       ],
       45,
       8
   ),
   new Recipe(
      "Salad2",
       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
       "https://www.acouplecooks.com/wp-content/uploads/2019/05/Chopped-Salad-001_1.jpg",
       [
         new Ingredient("Lettuce", 2, "Heads")
       ],
       15,
       2
   )
  ]

  retrieveRecipes(){
    return this.recipes.slice();
  }

  selectRecipe(index: number){
    return this.recipes[index];
  }

  submitRecipe(recipe: Recipe){
    this.recipes.push(recipe);
  }


}
