import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { RecipesRoutingModule } from './recipes/recipes-routing.module';
import { FeaturedRecipesComponent } from './home/featured-recipes/featured-recipes.component';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { IntroComponent } from './intro/intro.component';
import { SupaService } from './shared/services/supa.service';
import { SharedModule } from './shared/shared.module';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

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
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    RecipesRoutingModule,
    RouterModule,
    SharedModule
  ],
  providers: [
    SupaService,
    provideHttpClient(withInterceptorsFromDi()),
    // Off in development, where a cached bundle would mean serving yesterday's
    // build. The 30 second delay keeps the worker's own registration and its
    // first prefetch out of the way of the page finishing loading.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
