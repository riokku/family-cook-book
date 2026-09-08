import { Injectable } from '@angular/core';
import { SupaService } from './supa.service';

export interface ScannedIngredient {
  ingredientName: string;
  ingredientAmount: number;
  ingredientMeasurementType: string;
}

export interface ScannedIngredientGroup {
  ingredientGroupName: string;
  ingredients: ScannedIngredient[];
}

export interface ScannedStep {
  step: string;
  stepIngredients: [];
}

export interface ScannedRecipe {
  name: string;
  description: string;
  author: string;
  prep_time: number | null;
  cook_time: number | null;
  chill_time: number | null;
  total_time: number | null;
  serving_size: number | null;
  ingredient_groups: ScannedIngredientGroup[];
  steps: ScannedStep[];
  tags: string[];
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor(private supaService: SupaService) {}

  /**
   * Sends a recipe photo to the `scan-recipe` edge function, which calls Gemini
   * server-side and returns structured recipe data. The Gemini API key lives in
   * the function's environment and never reaches the browser.
   */
  async extractRecipeFromImage(base64Image: string, mimeType: string): Promise<ScannedRecipe> {
    return this.supaService.invokeFunction<ScannedRecipe>('scan-recipe', {
      image: base64Image,
      mimeType
    });
  }
}
