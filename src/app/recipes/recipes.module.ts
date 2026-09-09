import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { RecipesRoutingModule } from "./recipes-routing.module";
import { RecipesComponent } from "./recipes.component";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { AllRecipesComponent } from './all-recipes/all-recipes.component';
import { RecipeComponent } from "./recipe/recipe.component";
import { SlugGeneratorPipe } from "../shared/pipes/slug-generator.pipe";
import { RecipeEditComponent } from "./recipe-edit/recipe-edit.component";
import { IngredientAmountConverterPipe } from "../shared/pipes/ingredient-amount-converter.pipe";
import { LowerFirstLetterPipe } from "../shared/pipes/lower-first-letter.pipe";
import { IngredientSanitizerPipe } from "../shared/pipes/single-quantity-check.pipe";

@NgModule(
  {
    declarations: [
      RecipeComponent,
      RecipesComponent,
      AddRecipeComponent,
      AllRecipesComponent,
      RecipeEditComponent,
      SlugGeneratorPipe,
      IngredientAmountConverterPipe,
      LowerFirstLetterPipe,
      IngredientSanitizerPipe
    ],
    imports: [
      CommonModule,
      RouterModule,
      RecipesRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      DragDropModule,
      SharedModule
    ]
  }
)
export class RecipesModule {

}
