import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { readStringArray, writeJson } from '../utils/local-store.util';

/**
 * The recipes this visitor has saved, kept in localStorage.
 *
 * Deliberately per-device rather than per-account: the only sign-in this site
 * has is the admin one, and asking the family to make accounts to keep a list
 * of favourites would cost more than the feature is worth. The trade is that a
 * phone and a laptop keep separate lists, which for a fridge-side cookbook is
 * closer to how people actually use it anyway.
 *
 * Recipes are held by slug, not id: slugs are what the URLs already carry, so
 * a saved list survives the recipe being edited.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {

  private static readonly STORAGE_KEY = 'gogos-kitchen.favorites';

  private readonly slugsSubject = new BehaviorSubject<string[]>(readStringArray(FavoritesService.STORAGE_KEY));

  /** Emits the full list whenever it changes, so headers and cards stay in step. */
  readonly favorites$ = this.slugsSubject.asObservable();

  get slugs(): string[] {
    return this.slugsSubject.value;
  }

  get count(): number {
    return this.slugsSubject.value.length;
  }

  isFavorite(slug: string): boolean {
    return this.slugsSubject.value.includes(slug);
  }

  /** Adds or removes, and reports which it did so a caller can announce it. */
  toggle(slug: string): boolean {
    const nowFavorite = !this.isFavorite(slug);
    // Newest first: the saved list reads as a history, and the most recently
    // saved recipe is the one someone is most likely to be looking for.
    const next = nowFavorite
      ? [slug, ...this.slugsSubject.value]
      : this.slugsSubject.value.filter(entry => entry !== slug);

    this.slugsSubject.next(next);
    writeJson(FavoritesService.STORAGE_KEY, next);
    return nowFavorite;
  }

}
