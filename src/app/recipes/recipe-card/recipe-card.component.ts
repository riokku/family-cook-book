import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';

@Component({
    selector: 'app-recipe-card',
    templateUrl: './recipe-card.component.html',
    styleUrls: ['./recipe-card.component.scss'],
    standalone: false
})

export class RecipeCardComponent {
  @Input() recipe: Recipe;
  @Input() index: number;
  // Which tags are currently filtered on, so a card can show its own tags as
  // active. Defaults to empty for hosts that don't filter.
  @Input() activeTags: string[] = [];
  @Output() tagSelected = new EventEmitter<string>();
  // Hosts that cannot filter in place (the home page) render the tags as links
  // to the recipes page instead of as toggles that would go nowhere.
  @Input() tagsLinkToFilter: boolean = false;

  // image_path is optional on the model, and a stored URL can rot, so both the
  // empty and the broken case fall back to the placeholder rather than
  // rendering a broken-image icon.
  readonly placeholderImage: string = 'assets/images/recipe-placeholder.png';

  get imageSource(): string {
    return this.recipe.image_path || this.placeholderImage;
  }

  // The first cards are above the fold, so eager-load those and defer the rest.
  get imageLoading(): string | null {
    return this.index > 2 ? 'lazy' : null;
  }

  onImageError(event: Event){
    const img = event.target as HTMLImageElement;
    // Guard against looping if the placeholder itself ever fails to load.
    if(!img.src.endsWith(this.placeholderImage)){
      img.src = this.placeholderImage;
    }
  }

  isTagActive(tag: string): boolean {
    return this.activeTags.includes(tag);
  }

  tagLabel(tag: string): string {
    return this.isTagActive(tag) ? `Remove ${tag} filter` : `Filter by ${tag}`;
  }

  onTagClick(tag: string){
    this.tagSelected.emit(tag);
  }
}
