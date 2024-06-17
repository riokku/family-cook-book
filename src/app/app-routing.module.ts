import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { RecipesResolverService } from './shared/resolvers/recipe-resolve.service';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: [RecipesResolverService],
    title: "Gogo's Kitchen | Home"
  },
  {
    path: 'recipes',
    loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule)
  },
  {
    path: 'auth',
    component: AuthComponent,
    title: "Gogo's Kitchen | Authentication"
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    resolve: [RecipesResolverService],
    title: "Gogo's Kitchen | Manage Recipes"
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})

export class AppRoutingModule { }
