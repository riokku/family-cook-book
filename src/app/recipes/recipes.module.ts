import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { RecipeCardComponent } from "./recipe-card/recipe-card.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { RecipesRoutingModule } from "./recipes-routing.module";
import { RecipesComponent } from "./recipes.component";
import { CommonModule } from "@angular/common";
import { AllRecipesComponent } from './all-recipes/all-recipes.component';
import { RecipeComponent } from "./recipe/recipe.component";
import { SlugGeneratorPipe } from "../shared/pipes/slug-generator.pipe";
import { RecipeEditComponent } from "./recipe-edit/recipe-edit.component";
import { IngredientAmountConverterPipe } from "../shared/pipes/ingredient-amount-converter.pipe";

@NgModule(
  {
    declarations: [
      RecipeComponent,
      RecipesComponent,
      AddRecipeComponent,
      RecipeCardComponent,
      AllRecipesComponent,
      RecipeEditComponent,
      SlugGeneratorPipe,
      IngredientAmountConverterPipe
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
