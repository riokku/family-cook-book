import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { RecipeCardComponent } from "./recipe-card/recipe-card.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { RecipesRoutingModule } from "./recipes-routing.module";
import { RecipesComponent } from "./recipes.component";
import { CommonModule } from "@angular/common";
import { AllRecipesComponent } from './all-recipes/all-recipes.component';

@NgModule(
  {
    declarations: [
      RecipesComponent,
      AddRecipeComponent,
      RecipeCardComponent,
      AllRecipesComponent
    ],
    imports: [
      CommonModule,
      RouterModule,
      RecipesRoutingModule,
      FormsModule,
      ReactiveFormsModule
    ]
  }
)
export class RecipesModule {

}
