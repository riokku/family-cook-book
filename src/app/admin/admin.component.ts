import { Component, OnInit } from '@angular/core';
import { Recipe } from '../shared/models/recipe.model';
import { RecipeService } from '../shared/services/recipe.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit{

  allRecipes: Recipe[] = [];
  recipeResults: Recipe[] = [];
  searchInput: string;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.recipeResults = this.allRecipes;
    }, 100);
  }

  updateResults(){
    this.recipeResults = this.allRecipes.filter(recipe => recipe.name.includes(this.searchInput));
  }

}
