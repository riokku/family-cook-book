import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Recipe } from '../../shared/models/recipe.model';
import { RecipeService } from '../../shared/services/recipe.service';

@Component({
  selector: 'app-all-recipes',
  templateUrl: './all-recipes.component.html',
  styleUrls: ['./all-recipes.component.scss']
})

export class AllRecipesComponent implements OnInit {

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild("allCheckbox") allCheckbox: ElementRef;

  allRecipes: Recipe[] = [];
  selectedRecipes: Recipe[] = [];

  expandButtonSetting: boolean = false;
  expandButtonText: string = "Show more";
  searchLabel: string = "Search";
  searchInput: string;
  searchShowing: boolean = false;

  recipeCategories: string[];
  recipetotalTimes: number[];
  recipeServingSizes: number[];

  filterLabel: string = "Filter";
  filtersShowing: boolean = false;
  recipesFiltered: boolean = false;
  chosenFilter: string = "All";

  totalTimeSortTextOptions: string[] = ["Time", "Shortest to longest", "Longest to shortest"];
  servingSizeSortTextOptions: string[] = ["Servings", "Fewest to most", "Most to fewest"];

  totalTimeSortText: string = this.totalTimeSortTextOptions[0];
  servingSizeSortText: string = this.servingSizeSortTextOptions[0];


  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.selectedRecipes = this.allRecipes.sort((a:Recipe, b:Recipe) => {
        if (a.featured && !b.featured) {
          return -1;
        } else if (!a.featured && b.featured) {
          return 1;
        } else {
          return 0;
        }
      });
      this.setFilterOptions();
    }, 100);
  }

  setFilterOptions(){
    let fullCategoryList = this.allRecipes.map(el => {
      return el.tags;
    })
    this.recipeCategories = [...new Set(fullCategoryList.flat(1).sort())];
    console.log(this.recipeCategories);
  }

  updateResults(){
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  clearSearchInput(){
    this.searchInput = '';
    this.updateResults();
  }

  showSearch(){
    this.searchShowing = !this.searchShowing;
    if(this.searchShowing){
      this.searchLabel = "Hide"
    } else {
      this.searchLabel = "Search"
    }
  }

  showFilters(){
    this.filtersShowing = !this.filtersShowing;
    if(this.filtersShowing){
      this.filterLabel = "Hide"
    } else {
      this.filterLabel = "Filter"
    }
  }

  filterByCategory(event: any, selectedFilter: string){
    document.querySelectorAll(".filter-option").forEach(filter => filter.classList.remove("active"));
    event.target.classList.add("active");
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.tags.includes(selectedFilter));
    this.recipesFiltered = true;
    this.chosenFilter = selectedFilter;
  }

  resetFilter(){
    this.selectedRecipes = this.allRecipes;
    document.querySelectorAll(".filter-option").forEach(filter => filter.classList.remove("active"));
    this.chosenFilter = "All";
  }

  sortByTotalTime(){
    if(this.totalTimeSortText == this.totalTimeSortTextOptions[0]){
      this.totalTimeSortText = this.totalTimeSortTextOptions[1];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return a.total_time - b.total_time;
      });
    } else if (this.totalTimeSortText == this.totalTimeSortTextOptions[1]){
      this.totalTimeSortText = this.totalTimeSortTextOptions[2];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return b.total_time - a.total_time;
      });
    } else {
      this.totalTimeSortText = this.totalTimeSortTextOptions[1];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return a.total_time - b.total_time;
      });
    }
  }

  sortByServingSize(){
    if(this.servingSizeSortText == this.servingSizeSortTextOptions[0]){
      this.servingSizeSortText = this.servingSizeSortTextOptions[1];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return a.serving_size - b.serving_size;
      });
    } else if (this.servingSizeSortText == this.servingSizeSortTextOptions[1]){
      this.servingSizeSortText = this.servingSizeSortTextOptions[2];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return b.serving_size - a.serving_size;
      });
    } else {
      this.servingSizeSortText = this.servingSizeSortTextOptions[1];
      this.selectedRecipes = this.selectedRecipes.sort((a:Recipe, b:Recipe) => {
        return a.serving_size - b.serving_size;
      });
    }
  }

  resetSort(){
    this.totalTimeSortText = this.totalTimeSortTextOptions[0];
    this.servingSizeSortText = this.servingSizeSortTextOptions[0];
  }

}
