import { Component, OnInit } from '@angular/core';
import { Recipe } from '../shared/models/recipe.model';
import { RecipeService } from '../shared/services/recipe.service';
import { AuthService } from '../shared/services/auth.service';

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

  loggedInUserInfo: any;
  userApproved: any = localStorage.getItem('userApproved');

  constructor(private recipeService: RecipeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.allRecipes = this.recipeService.getRecipes();
    this.recipeResults = this.allRecipes;
    console.log(this.allRecipes);
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

  async signInWithGoogle() {
    try {
      await this.authService.googleSignIn();
      this.loggedInUserInfo = localStorage.getItem('loggedInUserID');
      console.log(this.loggedInUserInfo);

      await this.authService.getApprovedUsersList();
      this.userApproved = localStorage.getItem('userApproved');
      console.log(this.userApproved);
      return;

    } catch (error) {
      console.error("Error:", error);
      return;
    }
  }


}
