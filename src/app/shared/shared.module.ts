import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimeFormatPipe } from './pipes/time-format.pipe';
import { RecipeCardComponent } from '../recipes/recipe-card/recipe-card.component';
import { RevealOnScrollDirective } from './directives/reveal-on-scroll.directive';

// RecipeCardComponent lives here rather than in RecipesModule so the home page
// can use it too: RecipesModule is lazy-loaded, so importing it eagerly from
// AppModule would pull the whole recipes bundle into the initial payload.
@NgModule({
  declarations: [TimeFormatPipe, RecipeCardComponent, RevealOnScrollDirective],
  imports: [CommonModule, RouterModule],
  exports: [TimeFormatPipe, RecipeCardComponent, RevealOnScrollDirective]
})
export class SharedModule { }
