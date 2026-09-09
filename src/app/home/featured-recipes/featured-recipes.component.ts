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

  featuredRecipes: Recipe[] = [];

  // One card at a time: the carousel sits in a narrow column beside the hero
  // copy, so there is only ever room for a single card.
  useCarousel: boolean = false;

  constructor(
    private supaService: SupaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.featuredRecipes = await this.supaService.getFeaturedRecipes() ?? [];
    // With one recipe there is nothing to page between, so skip the chrome.
    this.useCarousel = this.featuredRecipes.length > 1;
  }

}
