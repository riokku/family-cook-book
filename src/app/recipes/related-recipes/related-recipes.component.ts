import { Component, Input, OnChanges } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';

/**
 * A few more recipes like the one being read, matched on shared tags.
 *
 * The end of a recipe is otherwise a dead end — the only way on is back to the
 * grid and a fresh search. Tags are already on every recipe and already drive
 * the filters, so they are the honest measure of "like this one" here rather
 * than something new to maintain.
 */
@Component({
  selector: 'app-related-recipes',
  templateUrl: './related-recipes.component.html',
  styleUrls: ['./related-recipes.component.scss'],
  standalone: false
})
export class RelatedRecipesComponent implements OnChanges {

  @Input() recipe: Recipe;

  related: Recipe[] = [];

  constructor(private supaService: SupaService){}

  ngOnChanges(): void {
    this.related = this.findRelated();
  }

  private findRelated(): Recipe[] {
    const tags = new Set(this.recipe?.tags || []);
    if(!tags.size){
      return [];
    }

    return (this.supaService.cachedRecipes || [])
      .filter(candidate => candidate.slug !== this.recipe.slug)
      .map(candidate => ({
        candidate,
        shared: (candidate.tags || []).filter(tag => tags.has(tag)).length
      }))
      .filter(scored => scored.shared > 0)
      .sort((a, b) =>
        // Most tags in common first; newest first among equals, so the row is
        // stable between visits rather than reordering on whatever the
        // database happened to return.
        b.shared - a.shared ||
        new Date(b.candidate.created).getTime() - new Date(a.candidate.created).getTime()
      )
      // Three: one row on a desktop grid, and few enough to stay a suggestion
      // rather than a second recipe list.
      .slice(0, 3)
      .map(scored => scored.candidate);
  }

}
