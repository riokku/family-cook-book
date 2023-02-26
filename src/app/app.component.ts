import { Component } from '@angular/core';
import { Recipe } from './shared/models/recipe.model';
import { RecipeService } from './shared/services/recipe.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'family-cook-book';

  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeService.fetchRecipes().subscribe((resRecipes) => {
      this.recipes = resRecipes;
    });
  }
}
