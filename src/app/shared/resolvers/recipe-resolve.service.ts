import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Recipe } from "../models/recipe.model";
import { RecipeService } from "../services/recipe.service";

@Injectable({
  providedIn: 'root'
})

export class RecipesResolverService implements Resolve<Recipe[]>{
  constructor(private recipesService: RecipeService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    const recipes = this.recipesService.getRecipes();

    if (recipes.length === 0){
      return this.recipesService.fetchRecipes();
    } else {
      return recipes;
    }
  }
}
