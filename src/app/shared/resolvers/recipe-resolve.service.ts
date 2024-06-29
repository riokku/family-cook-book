import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Recipe } from "../models/recipe.model";
import { SupaService } from "../services/supa.service";

@Injectable({
  providedIn: 'root'
})

export class RecipesResolverService implements Resolve<Recipe[]>{
  constructor(
    private supaService: SupaService
  ){}

  resolve(){
    return this.supaService.fetchRecipes();
  }
}
