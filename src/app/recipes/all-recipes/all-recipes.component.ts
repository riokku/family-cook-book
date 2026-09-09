import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from '../../shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';

interface SortOption {
  value: string;
  label: string;
}

@Component({
    selector: 'app-all-recipes',
    templateUrl: './all-recipes.component.html',
    styleUrls: ['./all-recipes.component.scss'],
    standalone: false
})

export class AllRecipesComponent implements OnInit, OnDestroy {

  // allRecipes keeps the pristine default order and is never mutated. Every
  // control feeds applyFilters(), which rebuilds selectedRecipes from it.
  allRecipes: Recipe[] = [];
  selectedRecipes: Recipe[] = [];

  searchInput: string = '';
  isLoading: boolean = true;
  // Placeholder cards shown while the fetch is in flight, so the grid keeps
  // its shape instead of jumping when results land.
  skeletonCards: number[] = [0, 1, 2, 3, 4, 5];

  // Announced to screen readers on a delay so typing a search term produces
  // one announcement of the final result rather than one per keystroke.
  liveSummary: string = '';
  private liveSummaryTimeout: ReturnType<typeof setTimeout>;

  recipeCategories: string[] = [];
  selectedCategories: string[] = [];
  // Collapsed by default to keep the recipe grid above the fold. The toggle
  // carries a count, and active categories stay visible as chips regardless.
  filtersShowing: boolean = false;

  // A single select rather than a pair of cycling buttons: it fits on the
  // toolbar row and every ordering is visible without clicking to discover it.
  sortOptions: SortOption[] = [
    { value: 'featured', label: 'Featured first' },
    { value: 'time-asc', label: 'Time: shortest first' },
    { value: 'time-desc', label: 'Time: longest first' },
    { value: 'servings-asc', label: 'Servings: fewest first' },
    { value: 'servings-desc', label: 'Servings: most first' }
  ];
  sortOption: string = 'featured';


  constructor(
    private supaService: SupaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.readFiltersFromUrl();
    await this.loadRecipes();
    this.setFilterOptions();
    // Expand the panel when arriving on a category link, so it is obvious why
    // the grid is already filtered.
    this.filtersShowing = this.selectedCategories.length > 0;
  }

  // Filters live in the URL, so a filtered view can be linked, bookmarked and
  // shared, and the home page's category tiles are just ordinary links.
  private readFiltersFromUrl(){
    const params = this.route.snapshot.queryParamMap;

    const categories = params.getAll('category')
      .flatMap(value => value.split(','))
      .map(value => value.trim())
      .filter(Boolean);
    this.selectedCategories = [...new Set(categories)];

    this.searchInput = params.get('search') ?? '';

    const sort = params.get('sort');
    if(sort && this.sortOptions.some(option => option.value === sort)){
      this.sortOption = sort;
    }
  }

  private writeFiltersToUrl(){
    // replaceUrl keeps typing in the search box out of the back-button history.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategories.length ? this.selectedCategories.join(',') : null,
        search: this.searchInput.trim() || null,
        sort: this.sortOption !== 'featured' ? this.sortOption : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  async loadRecipes(){
    try {
      const recipes = await this.supaService.fetchRecipes();
      this.allRecipes = [...(recipes ?? [])].sort((a:Recipe, b:Recipe) => {
        if (a.featured && !b.featured) {
          return -1;
        } else if (!a.featured && b.featured) {
          return 1;
        } else {
          return 0;
        }
      });
      this.applyFilters();
    } finally {
      this.isLoading = false;
    }
  }

  setFilterOptions(){
    let fullCategoryList = this.allRecipes.map(recipe => {
      return recipe.tags ?? [];
    })
    this.recipeCategories = [...new Set(fullCategoryList.flat(1).sort())];
  }

  // Single source of truth for what the grid shows: categories, then search,
  // then sort. Anything that changes one of those calls this.
  applyFilters(){
    let results = [...this.allRecipes];

    // Categories combine with OR, so adding one always widens the results
    // rather than risking a dead end between tags that never co-occur.
    if(this.selectedCategories.length){
      results = results.filter(recipe => {
        return (recipe.tags ?? []).some(tag => this.selectedCategories.includes(tag));
      });
    }

    const searchTerm = this.searchInput.trim().toLowerCase();
    if(searchTerm){
      results = results.filter(recipe => this.recipeMatchesSearch(recipe, searchTerm));
    }

    // 'featured' needs no branch: allRecipes is already in featured-first order.
    switch(this.sortOption){
      case 'time-asc':
        results.sort((a:Recipe, b:Recipe) => a.total_time - b.total_time);
        break;
      case 'time-desc':
        results.sort((a:Recipe, b:Recipe) => b.total_time - a.total_time);
        break;
      case 'servings-asc':
        results.sort((a:Recipe, b:Recipe) => a.serving_size - b.serving_size);
        break;
      case 'servings-desc':
        results.sort((a:Recipe, b:Recipe) => b.serving_size - a.serving_size);
        break;
    }

    this.selectedRecipes = results;
    this.scheduleLiveSummary();
    this.writeFiltersToUrl();
  }

  private scheduleLiveSummary(){
    clearTimeout(this.liveSummaryTimeout);
    this.liveSummaryTimeout = setTimeout(() => {
      this.liveSummary = this.resultSummary;
    }, 600);
  }

  ngOnDestroy(): void {
    clearTimeout(this.liveSummaryTimeout);
  }

  // Searching only the title hides recipes whose name never mentions what is
  // actually in them, so match the fields a cook would search by.
  private recipeMatchesSearch(recipe: Recipe, searchTerm: string): boolean {
    const ingredientNames = (recipe.ingredient_groups ?? []).flatMap(group => {
      return (group.ingredients ?? []).map(ingredient => ingredient.ingredientName);
    });
    const searchableFields = [
      recipe.name,
      recipe.description,
      recipe.author,
      ...(recipe.tags ?? []),
      ...ingredientNames
    ];
    return searchableFields.some(field => field?.toLowerCase().includes(searchTerm));
  }

  clearSearchInput(){
    this.searchInput = '';
    this.applyFilters();
  }

  showFilters(){
    this.filtersShowing = !this.filtersShowing;
  }

  toggleCategory(category: string){
    if(this.isCategorySelected(category)){
      this.selectedCategories = this.selectedCategories.filter(selected => selected != category);
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.applyFilters();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  // Clears filters and sort together, so one control always returns the page
  // to its default state.
  clearAll(){
    this.selectedCategories = [];
    this.searchInput = '';
    this.resetSort();
  }

  resetSort(){
    this.sortOption = 'featured';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategories.length > 0 || this.searchInput.trim().length > 0;
  }

  get hasActiveSort(): boolean {
    return this.sortOption != 'featured';
  }

  // Short form for the banner, beside the page title.
  get resultCount(): string {
    if(this.isLoading){
      return '';
    }
    const count = this.selectedRecipes.length;
    return `${count} ${count == 1 ? 'recipe' : 'recipes'}`;
  }

  // Read aloud by the results live region, so it has to be a real sentence.
  get resultSummary(): string {
    if(this.isLoading){
      return 'Loading recipes...';
    }
    const count = this.selectedRecipes.length;
    let summary = `Showing ${count} ${count == 1 ? 'recipe' : 'recipes'}`;
    if(this.selectedCategories.length){
      summary += ` in ${this.selectedCategories.join(' or ')}`;
    }
    if(this.searchInput.trim()){
      summary += ` matching "${this.searchInput.trim()}"`;
    }
    return summary;
  }

}
