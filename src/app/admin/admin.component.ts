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

  loggedInUserID: any;
  loggedInUserName: any;
  userApproved: any = localStorage.getItem('userApproved');
  unAuthorizedUserError: boolean;

  constructor(private recipeService: RecipeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.allRecipes = this.recipeService.getRecipes();
    this.recipeResults = this.allRecipes;
    this.loggedInUserName = localStorage.getItem("userName")?.split(" ")[0].slice(1);
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
      this.loggedInUserID = localStorage.getItem("loggedInUserID");
      this.loggedInUserName = localStorage.getItem("userName")?.split(" ")[0].slice(1);
      console.log(this.loggedInUserID, this.loggedInUserName);

      await this.authService.getApprovedUsersList();
      this.userApproved = localStorage.getItem("userApproved");
      if(!this.userApproved){
        this.unAuthorizedUserError = true;
      }
      console.log(this.userApproved);
      return;

    } catch (error) {
      console.error("Error:", error);
      return;
    }
  }

  signOut(){
    this.authService.googleSignOut();
  }

}
