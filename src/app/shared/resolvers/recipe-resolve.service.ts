import { Injectable } from "@angular/core";

import { Recipe } from "../models/recipe.model";
import { SupaService } from "../services/supa.service";

@Injectable({
  providedIn: 'root'
})

export class RecipesResolverService {
  constructor(
    private supaService: SupaService
  ){}

  resolve(){
    return this.supaService.fetchRecipes();
  }
}
