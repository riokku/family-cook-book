import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.gemini.apiKey}`;

  private readonly VALID_UNITS = [
    'Cups', 'Teaspoons', 'Tablespoons', 'Fluid ounces', 'Pints',
    'Quarts', 'Milliliters', 'Liters', 'Grams', 'Kilograms',
    'Ounces', 'Pounds', 'Count'
  ];

  private readonly VALID_TAGS = [
    'Appetizer', 'Dinner', 'Cast iron', 'Beverage', 'Breakfast',
    'Dessert', 'Cookies', 'Grilling', 'Italian', 'Mexican',
    'Salad', 'Seafood', 'Soup'
  ];

  constructor(private http: HttpClient) {}

  async extractRecipeFromImage(base64Image: string, mimeType: string): Promise<ScannedRecipe> {
    const prompt = `You are a recipe extraction assistant. Analyze this recipe image and extract all information into a structured JSON object.

Return ONLY a valid JSON object — no markdown, no code fences, no explanation — with exactly this structure:
{
  "name": "recipe name",
  "description": "a brief 1-2 sentence description of the dish",
  "author": "author or source if visible, otherwise empty string",
  "prep_time": <number in minutes, or null>,
  "cook_time": <number in minutes, or null>,
  "chill_time": <number in minutes, or null>,
  "total_time": <number in minutes, or null>,
  "serving_size": <number, or null>,
  "ingredient_groups": [
    {
      "ingredientGroupName": "group label (use 'Main' if there is no group label)",
      "ingredients": [
        {
          "ingredientName": "ingredient name",
          "ingredientAmount": <number>,
          "ingredientMeasurementType": "<one value from the allowed units list>"
        }
      ]
    }
  ],
  "steps": [
    { "step": "full step text", "stepIngredients": [] }
  ],
  "tags": ["tag1"],
  "notes": "any tips or notes from the recipe, or empty string"
}

Rules:
- ingredientMeasurementType MUST be exactly one of: ${this.VALID_UNITS.join(', ')}
- Use "Count" for whole items without a unit (e.g. 2 eggs, 3 cloves of garlic)
- tags MUST only contain values from: ${this.VALID_TAGS.join(', ')}
- All times must be plain integers in minutes
- If a value is not visible or not applicable, use null for numbers and "" for strings
- If the recipe has distinct ingredient sections (e.g. "Sauce", "Dough"), create one group per section`;

    const body = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    const response: any = await firstValueFrom(this.http.post(this.GEMINI_URL, body));
    const rawText: string = response.candidates[0].content.parts[0].text;

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
    return JSON.parse(cleaned) as ScannedRecipe;
  }
}
