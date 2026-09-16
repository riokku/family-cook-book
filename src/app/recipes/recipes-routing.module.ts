import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { RecipeComponent } from "./recipe/recipe.component";
import { RecipesComponent } from "./recipes.component";
import { AllRecipesComponent } from "./all-recipes/all-recipes.component";
import { RecipesResolverService } from "../shared/resolvers/recipe-resolve.service";
import { RecipeEditComponent } from "./recipe-edit/recipe-edit.component";

const routes: Routes = [
  {
    path: "",
    component: RecipesComponent,
    children: [
      {
        path:"",
        component: AllRecipesComponent,
        title: "Gogo's Kitchen | Recipes"
      },
      {
        path: "add-recipe",
        component: AddRecipeComponent,
        title: "Gogo's Kitchen | Add Recipe"
      },
      {
        path: ":slug",
        component: RecipeComponent,
        resolve: [RecipesResolverService],
        // Without this the router's default, paramsOrQueryParamsChange, re-runs
        // the resolver whenever a query parameter changes — so picking a
        // portion refetched every recipe in the table to render the same one
        // at a different scale. The recipe depends on :slug and nothing else.
        runGuardsAndResolvers: "pathParamsChange"
      },
      {
        path: ":slug/edit",
        component: RecipeEditComponent,
        resolve: [RecipesResolverService]
      }
    ]
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})

export class RecipesRoutingModule{}
