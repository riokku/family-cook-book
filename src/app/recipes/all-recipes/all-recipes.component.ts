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

  filterLabel: string = "Filter";
  filtersShowing: boolean = false;

  recipesFiltered: boolean = false;

  cookTimeSortTextOptions: string[] = ["Sort by cook time", "Shortest to longest", "Longest to shortest"];
  servingSizeSortTextOptions: string[] = ["Sort by serving size", "Shortest to longest", "Longest to shortest"];

  cookTimeSortText: string = this.cookTimeSortTextOptions[0];
  servingSizeSortText: string = this.servingSizeSortTextOptions[0];


  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.selectedRecipes = this.allRecipes.sort((a:Recipe, b:Recipe) => {
        return Number(b.featured) - Number(a.featured);
      });

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


  sortByCookTime(){
    if(this.cookTimeSortText == this.cookTimeSortTextOptions[0]){
      this.cookTimeSortText = this.cookTimeSortTextOptions[1];
    } else if (this.cookTimeSortText == this.cookTimeSortTextOptions[1]){
      this.cookTimeSortText = this.cookTimeSortTextOptions[2];
    } else {
      this.cookTimeSortText = this.cookTimeSortTextOptions[0];
    }
  }

  sortByServingSize(){
    if(this.servingSizeSortText == this.servingSizeSortTextOptions[0]){
      this.servingSizeSortText = this.servingSizeSortTextOptions[1];
    } else if (this.servingSizeSortText == this.servingSizeSortTextOptions[1]){
      this.servingSizeSortText = this.servingSizeSortTextOptions[2];
    } else {
      this.servingSizeSortText = this.servingSizeSortTextOptions[0];
    }
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
