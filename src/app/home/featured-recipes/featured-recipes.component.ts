import { Component, Input } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { RecipeService } from 'src/app/shared/services/recipe.service';


@Component({
  selector: 'app-featured-recipes',
  templateUrl: './featured-recipes.component.html',
  styleUrls: ['./featured-recipes.component.scss']
})
export class FeaturedRecipesComponent {

  @Input() index: number;

  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.recipes = this.recipeService.getFeaturedRecipes();
      console.log(this.recipes);
    }, 20);

  }

}
