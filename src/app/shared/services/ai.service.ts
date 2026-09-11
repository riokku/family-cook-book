import { Injectable } from '@angular/core';
import { SupaService } from './supa.service';
import { environment } from 'src/environments/environment';

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
  /** Only a URL import fills these: where the recipe came from, and its photo. */
  link?: string;
  image_path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor(private supaService: SupaService) {}

  /**
   * Reads a recipe out of a photo of it.
   */
  extractRecipeFromImage(base64Image: string, mimeType: string): Promise<ScannedRecipe> {
    return this.readRecipe({ image: base64Image, mimeType });
  }

  /**
   * Reads a recipe off a web page. The page is fetched and stripped down by the
   * edge function rather than the browser — the browser would be blocked by
   * CORS on nearly every recipe site.
   */
  extractRecipeFromUrl(url: string): Promise<ScannedRecipe> {
    return this.readRecipe({ url });
  }

  /**
   * Sends a payload to the `scan-recipe` edge function, which calls Gemini
   * server-side and returns structured recipe data. The Gemini API key lives in
   * the function's environment and never reaches the browser.
   *
   * Uses fetch rather than supabase.functions.invoke() so that a failure's
   * response body is readable — invoke() wraps errors in a shape that hides the
   * function's own message, which turned real errors into misleading ones.
   */
  private async readRecipe(payload: Record<string, string>): Promise<ScannedRecipe> {
    const token = await this.supaService.getAccessToken();
    if (!token) {
      throw new Error('You need to be signed in as an admin to read in recipes.');
    }

    const response = await fetch(`${environment.supabase.url}/functions/v1/scan-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': environment.supabase.key
      },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();

    if (!response.ok) {
      let message = `That didn't work (${response.status})`;
      try {
        const body = JSON.parse(raw);
        if (body?.error) message = body.error;
      } catch {
        if (raw) message = `${message}: ${raw.slice(0, 300)}`;
      }
      console.error('scan-recipe returned', response.status, raw);
      throw new Error(message);
    }

    return JSON.parse(raw) as ScannedRecipe;
  }
}
