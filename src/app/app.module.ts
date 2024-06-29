import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { RecipeService } from './shared/services/recipe.service';
import { RecipesRoutingModule } from './recipes/recipes-routing.module';
import { FeaturedRecipesComponent } from './home/featured-recipes/featured-recipes.component';
import { RouterModule } from '@angular/router';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { AuthComponent } from './auth/auth.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { IntroComponent } from './intro/intro.component';
import { SupaService } from './shared/services/supa.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AdminComponent,
    FeaturedRecipesComponent,
    AuthComponent,
    LoadingSpinnerComponent,
    IntroComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    RecipesRoutingModule,
    RouterModule,
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  ],
  providers: [
    RecipeService,
    SupaService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
