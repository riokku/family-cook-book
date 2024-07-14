import { Component, Input } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';


@Component({
  selector: 'app-featured-recipes',
  templateUrl: './featured-recipes.component.html',
  styleUrls: ['./featured-recipes.component.scss']
})

export class FeaturedRecipesComponent {

  @Input() index: number;

  featuredRecipes: Recipe[];

  constructor(
    private supaService: SupaService
  ) {}

  async ngOnInit(): Promise<void> {
      this.featuredRecipes = await this.supaService.getFeaturedRecipes();
  }

}
