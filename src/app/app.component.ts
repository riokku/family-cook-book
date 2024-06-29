import { Component } from '@angular/core';
import { RecipeService } from './shared/services/recipe.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'family-cook-book';

  showSite: boolean = false;

  constructor(
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.recipeService.fetchRecipes().subscribe();
    setTimeout(() => {
      this.showSite = true;
    }, 3000);

  }


}
