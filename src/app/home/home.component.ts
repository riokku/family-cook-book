import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe } from '../shared/models/recipe.model';
import { SupaService } from '../shared/services/supa.service';

interface HomeStat {
  label: string;
  value: number;
  display: number;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {

  recipes: Recipe[] = [];
  categories: string[] = [];
  stats: HomeStat[] = [];

  private countUpFrame: number;

  constructor(
    private supaService: SupaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // The home route resolves recipes before activating, so this reads the
    // cache rather than issuing a second fetch.
    this.recipes = this.supaService.cachedRecipes ?? [];
    this.categories = [...new Set(this.recipes.flatMap(recipe => recipe.tags ?? []).sort())];

    const cooks = new Set(this.recipes.map(recipe => recipe.author).filter(Boolean));
    this.stats = [
      { label: this.recipes.length === 1 ? 'Recipe' : 'Recipes', value: this.recipes.length, display: 0 },
      { label: this.categories.length === 1 ? 'Category' : 'Categories', value: this.categories.length, display: 0 },
      { label: cooks.size === 1 ? 'Author' : 'Authors', value: cooks.size, display: 0 }
    ];

    this.countUp();
  }

  // Counts each stat up from zero on load. Anyone who has asked for reduced
  // motion gets the final numbers immediately instead.
  private countUp(){
    const prefersReducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(prefersReducedMotion || typeof requestAnimationFrame === 'undefined'){
      this.stats.forEach(stat => stat.display = stat.value);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.stats.forEach(stat => stat.display = Math.round(stat.value * eased));
      if(progress < 1){
        this.countUpFrame = requestAnimationFrame(step);
      }
    };
    this.countUpFrame = requestAnimationFrame(step);
  }

  surpriseMe(){
    if(!this.recipes.length){
      return;
    }
    const recipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];
    this.router.navigate(['/recipes', recipe.slug]);
  }

  ngOnDestroy(): void {
    if(this.countUpFrame){
      cancelAnimationFrame(this.countUpFrame);
    }
  }

}
