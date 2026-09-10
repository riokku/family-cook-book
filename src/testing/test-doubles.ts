import { BehaviorSubject } from 'rxjs';
import { Recipe } from '../app/shared/models/recipe.model';

// Builds a Recipe with sensible defaults so a test only has to state the
// fields it actually cares about.
export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 1,
    name: 'Test recipe',
    slug: 'test-recipe',
    author: 'Gogo',
    description: 'A recipe used in tests.',
    image_path: 'https://example.test/image.jpg',
    ingredient_groups: [],
    total_time: 30,
    serving_size: 4,
    featured: false,
    steps: [],
    tags: [],
    created: new Date('2026-01-01'),
    ...overrides
  } as Recipe;
}

// Stands in for SupaService so specs never construct a real Supabase client
// (which warns about duplicate GoTrueClient instances and reaches the network).
export class SupaServiceStub {
  recipes: Recipe[] = [];
  authState$ = new BehaviorSubject<unknown>(null).asObservable();

  async fetchRecipes(): Promise<Recipe[]> {
    return this.recipes;
  }

  get cachedRecipes(): Recipe[] {
    return this.recipes;
  }

  getRecipe(slug: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.slug === slug);
  }

  async getFeaturedRecipes(): Promise<Recipe[]> {
    return this.recipes.filter(recipe => recipe.featured);
  }

  async checkAdminStatus(): Promise<boolean> {
    return false;
  }

  async getLoggedInUser() {
    return null;
  }

  async getAccessToken(): Promise<string | null> {
    return null;
  }

  async logout(): Promise<void> {}

  async addRecipeNew(): Promise<void> {}
  async updateRecipe(): Promise<void> {}
  async deleteRecipe(): Promise<void> {}
  async uploadRecipeImage(): Promise<string> {
    return '';
  }
  async deleteRecipeImage(): Promise<void> {}

  signUp() {
    return Promise.resolve({});
  }
  signIn() {
    return Promise.resolve({});
  }
}

export class AiServiceStub {
  async extractRecipeFromImage() {
    return {} as never;
  }
}
