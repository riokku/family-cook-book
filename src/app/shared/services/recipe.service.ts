import { Injectable } from "@angular/core";
import { Recipe } from "../models/recipe.model";
import { map, tap } from "rxjs";


import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class RecipeService{

  constructor(private http: HttpClient) {}

  private recipes: Recipe[] = [];

  fetchRecipes(){
    console.log("recipe service fetch");
    return this.http
      .get<Recipe[]>('https://family-cook-book-b02f5-default-rtdb.firebaseio.com/recipes.json')
      .pipe(
        map((response) => {
          const newRecipes =  [];
          for(const key in response){
            newRecipes.push({
              ...response[key]
            })
          }
          return newRecipes;
        }),
        tap((response) => {
          this.setRecipes(response);
        })
      )
  }

  setRecipes(recipes: Recipe[]){
    this.recipes = recipes;
    console.log(`Recipes are set. There are ${recipes.length} recipes registered.`);
  }

  getRecipes(){
    return this.recipes;
  }

  getRecipe(index: number){
    return this.recipes[index];
  }

  selectRecipe(index: number){
    return this.recipes[index];
  }

  submitRecipe(recipe: Recipe){
    console.log(recipe);
    return this.http.post('https://family-cook-book-b02f5-default-rtdb.firebaseio.com/recipes.json', recipe).subscribe(response => {
      console.log(response)
    });
  }

}
