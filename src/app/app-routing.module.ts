import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { RecipesComponent } from './recipes/recipes.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'recipes',
    component: RecipesComponent
  },
  {
    path: 'add-recipe',
    component: AddRecipeComponent
  },
  {
    path: 'sign-in',
    component: AuthComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
