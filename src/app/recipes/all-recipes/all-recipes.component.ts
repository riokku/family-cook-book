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

  recipeCategories: any [];

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.allRecipes = this.recipeService.getRecipes();
      this.selectedRecipes = this.allRecipes;
      let fullCategoryList = this.allRecipes.map(el => {
        return el.tags;
      })
      this.recipeCategories = [...new Set(fullCategoryList.flat(1).sort())];
      this.allCheckbox.nativeElement.checked = true;
    }, 100);
  }

  resetRecipes(){
    this.uncheckAll();
    this.selectedRecipes = this.allRecipes;
    this.allCheckbox.nativeElement.checked = true;
  }

  filterRecipes(category: string){
    this.uncheckAll();
    this.selectedRecipes = this.allRecipes.filter(recipe => recipe.tags.includes(category));
  }

  uncheckAll(){
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
    if(this.allCheckbox.nativeElement.checked === true){
      this.allCheckbox.nativeElement.checked = false;
    }
  }

}
