import { Component, OnDestroy, OnInit } from '@angular/core';
import { Recipe } from '../shared/models/recipe.model';
import { SupaService } from '../shared/services/supa.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: false
})
export class AdminComponent implements OnInit{

  isAuthenticated: boolean = false;

  allRecipes: Recipe[] = [];
  recipeResults: Recipe[] = [];
  searchInput: string;
  toBeDeletedRecipe: Recipe;
  toBeDeletedRecipeName: string;

  currentPage = 1;
  readonly pageSize = 10;

  get pagedResults(): Recipe[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.recipeResults.slice(start, start + this.pageSize);
  }

  constructor(
    private supaService: SupaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  async loadRecipes(){
    this.allRecipes = await this.supaService.fetchRecipes();

    //Sorts array be created date, most recent first, converts strings > Dates > numbers then compares
    this.recipeResults = this.allRecipes.sort((a: Recipe, b: Recipe) => +new Date(b.created) - +new Date(a.created));
  }

  updateResults(){
    this.currentPage = 1;
    this.recipeResults = this.allRecipes.filter(recipe => recipe.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  clearSearchInput(){
    this.searchInput = '';
    this.currentPage = 1;
    this.updateResults();
  }

  setToBeDeletedRecipe(readyToDeleteRecipe: Recipe){
    this.toBeDeletedRecipe = readyToDeleteRecipe;
    this.toBeDeletedRecipeName = this.toBeDeletedRecipe.name;
  }

  deleteRecipe(deletedRecipeID: any){
    this.supaService.deleteRecipe(deletedRecipeID);
    this.recipeResults = this.recipeResults.filter(recipe => recipe.id != deletedRecipeID);
    this.allRecipes = this.allRecipes.filter(recipe => recipe.id != deletedRecipeID);
    const maxPage = Math.ceil(this.recipeResults.length / this.pageSize) || 1;
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
  }

  onLogout(){
    this.supaService.logout();
    this.router.navigate(['/auth']);
  }

}
