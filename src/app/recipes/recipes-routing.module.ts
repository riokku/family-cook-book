import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { RecipeComponent } from "./recipe/recipe.component";
import { RecipesComponent } from "./recipes.component";
import { AllRecipesComponent } from "./all-recipes/all-recipes.component";
import { RecipesResolverService } from "../shared/resolvers/recipe-resolve.service";

const routes: Routes = [
  {
    path: '',
    component: RecipesComponent,
    children: [
      {
        path:'',
        component: AllRecipesComponent
      },
      {
        path: 'add-recipe',
        component: AddRecipeComponent
      },
      {
        path: ':id',
        component: RecipeComponent,
        resolve: [RecipesResolverService]
      }
    ]
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class RecipesRoutingModule{

}
