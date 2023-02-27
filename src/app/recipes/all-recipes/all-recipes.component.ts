import { Component } from '@angular/core';

import { Recipe } from '../../shared/models/recipe.model';

import { RecipeService } from '../../shared/services/recipe.service';

@Component({
  selector: 'app-all-recipes',
  templateUrl: './all-recipes.component.html',
  styleUrls: ['./all-recipes.component.scss']
})
export class AllRecipesComponent {

  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.recipes = this.recipeService.getRecipes();
    }, 20);

  }


}
