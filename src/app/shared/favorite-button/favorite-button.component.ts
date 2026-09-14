import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FavoritesService } from '../services/favorites.service';

/**
 * The save-this-recipe heart, used on a card and on the recipe page.
 *
 * Subscribes rather than reading once: the same recipe can be on screen twice —
 * a card in the grid and the favourites count in the toolbar — and both should
 * turn over on one press.
 */
@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
  standalone: false
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {

  @Input() slug: string;
  /** Used in the label, so the button says what it saves rather than "save". */
  @Input() recipeName: string = 'this recipe';
  /** 'card' sits over a photo; 'page' sits in the recipe header's button row. */
  @Input() variant: 'card' | 'page' = 'card';

  isFavorite: boolean = false;

  private subscription: Subscription;

  constructor(private favorites: FavoritesService){}

  ngOnInit(): void {
    this.subscription = this.favorites.favorites$.subscribe(slugs => {
      this.isFavorite = slugs.includes(this.slug);
    });
  }

  get label(): string {
    return this.isFavorite
      ? `Remove ${this.recipeName} from your saved recipes`
      : `Save ${this.recipeName} to your recipes`;
  }

  onClick(event: Event): void {
    // The card is one big stretched link, so without this the press navigates
    // to the recipe on the way to saving it.
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.slug);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
