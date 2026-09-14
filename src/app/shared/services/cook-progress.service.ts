import { Injectable } from '@angular/core';
import { readJson, removeKey, writeJson } from '../utils/local-store.util';

interface StoredProgress {
  /** Indexes of the ingredients checked off, as "groupIndex:ingredientIndex". */
  ingredients: string[];
  /** Indexes of the steps checked off. */
  steps: number[];
  /** When it was last touched, so stale progress can be dropped. */
  updated: number;
}

const EMPTY: StoredProgress = { ingredients: [], steps: [], updated: 0 };

/**
 * What has been checked off while cooking a recipe, kept per recipe.
 *
 * Persisted rather than held in the component because of how a phone behaves
 * in a kitchen: it is put down, it locks, a timer goes off, someone opens a
 * message — and the page is reloaded from scratch when they come back. Losing
 * the place in a recipe every time is the whole problem this solves.
 *
 * Progress expires. Coming back to a recipe a week later and finding half of it
 * already crossed off is worse than starting clean, so anything older than a
 * day is treated as a fresh start.
 */
@Injectable({ providedIn: 'root' })
export class CookProgressService {

  private static readonly KEY_PREFIX = 'gogos-kitchen.progress.';
  private static readonly MAX_AGE_MS = 24 * 60 * 60 * 1000;

  private keyFor(slug: string): string {
    return CookProgressService.KEY_PREFIX + slug;
  }

  load(slug: string): { ingredients: Set<string>, steps: Set<number> } {
    const stored = readJson<StoredProgress>(this.keyFor(slug), EMPTY);

    const ingredients = Array.isArray(stored.ingredients) ? stored.ingredients : [];
    const steps = Array.isArray(stored.steps) ? stored.steps : [];
    const updated = typeof stored.updated === 'number' ? stored.updated : 0;

    if(Date.now() - updated > CookProgressService.MAX_AGE_MS){
      this.clear(slug);
      return { ingredients: new Set(), steps: new Set() };
    }

    return {
      ingredients: new Set(ingredients.filter(entry => typeof entry === 'string')),
      steps: new Set(steps.filter(entry => typeof entry === 'number'))
    };
  }

  save(slug: string, ingredients: Set<string>, steps: Set<number>): void {
    // Nothing ticked is the same as never having started, and writing a key per
    // recipe merely visited would fill the store with empties.
    if(ingredients.size === 0 && steps.size === 0){
      this.clear(slug);
      return;
    }

    writeJson(this.keyFor(slug), {
      ingredients: [...ingredients],
      steps: [...steps],
      updated: Date.now()
    });
  }

  clear(slug: string): void {
    removeKey(this.keyFor(slug));
  }

}
