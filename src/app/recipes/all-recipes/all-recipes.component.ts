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

  recipeCategories: any [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.recipes = this.recipeService.getRecipes();
      let fullCategoryList = this.recipes.map(el => {
        return el.tags;
      })
      this.recipeCategories = [...new Set(fullCategoryList.flat(1))];
    }, 20);
  }


  filterRecipes(category: string){
    alert(category);
  }

}
