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
  toBeDeletedRecipe: Recipe;
  toBeDeletedRecipeName: string;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.recipeResults = this.allRecipes;
      console.log(this.allRecipes);
    }, 200);
  }

  updateResults(){
    this.recipeResults = this.allRecipes.filter(recipe => recipe.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  clearSearchInput(){
    this.searchInput = '';
    this.updateResults();
  }

  setToBeDeletedRecipe(readyToDeleteRecipe: Recipe){
    this.toBeDeletedRecipe = readyToDeleteRecipe;
    this.toBeDeletedRecipeName = this.toBeDeletedRecipe.name;
  }

  deleteRecipe(deletedRecipeID:any){
    this.recipeService.deleteRecipe(deletedRecipeID);
    this.recipeResults = this.recipeResults.filter(recipe => recipe.id != deletedRecipeID);
  }

  recipeTrackBy(index: number, recipe: Recipe){
    return recipe.id;
  }

}
