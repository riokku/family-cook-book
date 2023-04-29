import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Recipe } from '../../shared/models/recipe.model';
import { RecipeService } from '../../shared/services/recipe.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-all-recipes',
  templateUrl: './all-recipes.component.html',
  styleUrls: ['./all-recipes.component.scss']
})

export class AllRecipesComponent {

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild("allCheckbox") allCheckbox: ElementRef;

  allRecipes: Recipe[] = [];
  selectedRecipes: Recipe[] = [];

  expandButtonSetting: boolean = false;
  expandButtonText: string = "Show more";
  searchInput: string;

  recipeCategories: string[];
  recipeCookTimes: number[];
  recipeServingSizes: number[];
  recipeResults: Recipe[] = [];

  filterLabel: string = "Filter";
  filtersShowing: boolean = false;

  recipesFiltered: boolean = false;


  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.selectedRecipes = this.allRecipes;
      let fullCategoryList = this.allRecipes.map(el => {
        return el.tags;
      })
      this.recipeCategories = [...new Set(fullCategoryList.flat(1).sort())];

      let fullCookTImes =  this.allRecipes.map(el => {
        return el.cookTime;
      })
      this.recipeCookTimes = [...new Set(fullCookTImes.flat(1).sort())];

      let fullServingSizes =  this.allRecipes.map(el => {
        return el.servingSize;
      })
      this.recipeServingSizes = [...new Set(fullServingSizes.flat(1).sort())];

      console.log(this.recipeCategories, this.recipeCookTimes, this.recipeServingSizes);

      //this.allCheckbox.nativeElement.checked = true;
      this.recipeResults = this.allRecipes;
    }, 100);
  }

  resetRecipes(){
    this.uncheckAll();
    this.selectedRecipes = this.allRecipes;
    this.allCheckbox.nativeElement.checked = true;
  }

  updateResults(){
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.name.toLowerCase().includes(this.searchInput.toLowerCase()));
  }

  clearSearchInput(){
    this.searchInput = '';
    this.updateResults();
  }

  showFilters(){
    this.filtersShowing = !this.filtersShowing;
    if(this.filtersShowing){
      this.filterLabel = "Hide"
    } else {
      this.filterLabel = "Filter"
    }
  }

  filterRecipes(category: string){
    this.uncheckAll();
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.tags.includes(category));
  }

  filterByCategory(selectedFilter:any){
    selectedFilter = selectedFilter.target.value;
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.tags.includes(selectedFilter));
    this.recipesFiltered = true;
  }

  resetFilters(){
    const filters = Array.from(document.getElementsByClassName('filterSelects')) as HTMLSelectElement[];

    filters.forEach((select: HTMLSelectElement) => {
      select.selectedIndex = 0;
    });

    this.selectedRecipes = this.allRecipes;
    this.recipesFiltered = false;
  }


  //Old TS for left-side filters
  uncheckAll(){
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
    if(this.allCheckbox.nativeElement.checked === true){
      this.allCheckbox.nativeElement.checked = false;
    }
  }

  expandCategoryList(){
    const filterWrapper = document.getElementById("filter-wrapper");
    filterWrapper?.classList.toggle("expanded");

    this.expandButtonSetting = !this.expandButtonSetting;
    if(!this.expandButtonSetting){
      this.expandButtonText = "Show more";
    } else {
      this.expandButtonText = "Show less";
    }
  }

}
