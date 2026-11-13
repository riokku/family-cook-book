import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';


@Component({
    selector: 'app-featured-recipes',
    templateUrl: './featured-recipes.component.html',
    styleUrls: ['./featured-recipes.component.scss'],
    standalone: false
})

export class FeaturedRecipesComponent implements OnInit {

  // One shelf's worth: three plates fill a single row of the case on desktop,
  // where a fourth would sit alone on a shelf of its own.
  static readonly SHELF_SIZE = 3;

  featuredRecipes: Recipe[] = [];

  constructor(
    private supaService: SupaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.featuredRecipes = (await this.supaService.getFeaturedRecipes() ?? [])
      .slice(0, FeaturedRecipesComponent.SHELF_SIZE);
  }

}
