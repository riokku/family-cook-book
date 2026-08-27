import { Component, OnInit } from '@angular/core';
import { RecipeService } from './shared/services/recipe.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {

  title = 'family-cook-book';

  constructor(
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.recipeService.fetchRecipes().subscribe();
  }

}
