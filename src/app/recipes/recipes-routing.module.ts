import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddRecipeComponent } from "./add-recipe/add-recipe.component";
import { RecipeComponent } from "./recipe/recipe.component";
import { RecipesComponent } from "./recipes.component";
import { AllRecipesComponent } from "./all-recipes/all-recipes.component";

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
        component: RecipeComponent
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
