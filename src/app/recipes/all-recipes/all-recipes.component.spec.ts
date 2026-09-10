import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';

import { AllRecipesComponent } from './all-recipes.component';
import { SupaService } from 'src/app/shared/services/supa.service';
import { makeRecipe, SupaServiceStub } from 'src/testing/test-doubles';

// A small library with deliberate overlap, so category OR, search and sort can
// each be told apart from the others.
const RECIPES = [
  makeRecipe({ id: 1, name: 'Lasagne', slug: 'lasagne', author: 'Gogo', featured: false,
    tags: ['Dinner', 'Italian'], total_time: 90, serving_size: 8,
    description: 'Layered pasta bake.' }),
  makeRecipe({ id: 2, name: 'Pancakes', slug: 'pancakes', author: 'Dad', featured: true,
    tags: ['Breakfast'], total_time: 20, serving_size: 4,
    description: 'Fluffy stack.' }),
  makeRecipe({ id: 3, name: 'Roast chicken', slug: 'roast-chicken', author: 'Gogo', featured: false,
    tags: ['Dinner'], total_time: 120, serving_size: 6,
    description: 'Sunday centrepiece.' }),
  makeRecipe({ id: 4, name: 'Tiramisu', slug: 'tiramisu', author: 'Nonna', featured: false,
    tags: ['Dessert', 'Italian'], total_time: 40, serving_size: 10,
    description: 'Coffee and mascarpone.',
    ingredient_groups: [
      { ingredientGroupName: 'Base', ingredients: [
        { ingredientName: 'Espresso', ingredientAmount: 200, ingredientMeasurementType: 'ml' }
      ] }
    ] as never })
];

describe('AllRecipesComponent', () => {
  let component: AllRecipesComponent;
  let fixture: ComponentFixture<AllRecipesComponent>;
  let supa: SupaServiceStub;
  let queryParams: Record<string, string>;

  async function setUp(initialParams: Record<string, string> = {}) {
    queryParams = initialParams;

    await TestBed.configureTestingModule({
      declarations: [AllRecipesComponent],
      imports: [FormsModule],
      providers: [
        { provide: SupaService, useClass: SupaServiceStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(initialParams) } }
        },
        // Capture what the component writes to the URL without a real router.
        {
          provide: Router,
          useValue: {
            navigate: (_commands: unknown[], extras: { queryParams: Record<string, string> }) => {
              queryParams = extras.queryParams;
              return Promise.resolve(true);
            }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AllRecipesComponent);
    component = fixture.componentInstance;
    supa = TestBed.inject(SupaService) as unknown as SupaServiceStub;
    supa.recipes = RECIPES;

    await component.ngOnInit();
    fixture.detectChanges();
  }

  const names = () => component.selectedRecipes.map(recipe => recipe.name);

  afterEach(() => {
    component?.ngOnDestroy();
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await setUp();
    expect(component).toBeTruthy();
  });

  it('shows every recipe by default, featured first', async () => {
    await setUp();
    expect(component.selectedRecipes.length).toBe(4);
    expect(names()[0]).toBe('Pancakes');
  });

  describe('composition', () => {
    it('keeps the category when a search term is typed', async () => {
      await setUp();
      component.toggleCategory('Italian');
      component.searchInput = 'lasagne';
      component.applyFilters();

      expect(names()).toEqual(['Lasagne']);
      expect(component.selectedCategories).toEqual(['Italian']);
    });

    it('keeps the search term when a category is picked', async () => {
      await setUp();
      component.searchInput = 'a';
      component.applyFilters();
      component.toggleCategory('Dessert');

      expect(component.searchInput).toBe('a');
      expect(names()).toEqual(['Tiramisu']);
    });

    it('keeps the sort when the filters change', async () => {
      await setUp();
      component.sortOption = 'time-asc';
      component.applyFilters();
      component.toggleCategory('Dinner');

      expect(names()).toEqual(['Lasagne', 'Roast chicken']);
    });
  });

  describe('categories', () => {
    it('combines with OR, so adding one widens the results', async () => {
      await setUp();
      component.toggleCategory('Dessert');
      const oneCategory = component.selectedRecipes.length;
      component.toggleCategory('Breakfast');

      expect(component.selectedRecipes.length).toBeGreaterThan(oneCategory);
      expect(names().sort()).toEqual(['Pancakes', 'Tiramisu']);
    });

    it('toggles a selected category back off', async () => {
      await setUp();
      component.toggleCategory('Dinner');
      component.toggleCategory('Dinner');

      expect(component.selectedCategories).toEqual([]);
      expect(component.selectedRecipes.length).toBe(4);
    });
  });

  describe('search', () => {
    it('matches on ingredient names, not just the title', async () => {
      await setUp();
      component.searchInput = 'espresso';
      component.applyFilters();

      expect(names()).toEqual(['Tiramisu']);
    });

    it('matches on author', async () => {
      await setUp();
      component.searchInput = 'nonna';
      component.applyFilters();

      expect(names()).toEqual(['Tiramisu']);
    });

    it('ignores surrounding whitespace', async () => {
      await setUp();
      component.searchInput = '   lasagne  ';
      component.applyFilters();

      expect(names()).toEqual(['Lasagne']);
    });
  });

  describe('sorting', () => {
    it('orders by total time in both directions', async () => {
      await setUp();
      component.sortOption = 'time-asc';
      component.applyFilters();
      expect(names()).toEqual(['Pancakes', 'Tiramisu', 'Lasagne', 'Roast chicken']);

      component.sortOption = 'time-desc';
      component.applyFilters();
      expect(names()).toEqual(['Roast chicken', 'Lasagne', 'Tiramisu', 'Pancakes']);
    });

    it('never mutates the source list', async () => {
      await setUp();
      const originalOrder = component.allRecipes.map(recipe => recipe.name);

      component.sortOption = 'time-desc';
      component.applyFilters();

      expect(component.allRecipes.map(recipe => recipe.name)).toEqual(originalOrder);
    });

    it('restores the default order when the sort is reset', async () => {
      await setUp();
      const defaultOrder = names();

      component.sortOption = 'servings-desc';
      component.applyFilters();
      expect(names()).not.toEqual(defaultOrder);

      component.resetSort();
      expect(names()).toEqual(defaultOrder);
    });
  });

  describe('clearAll', () => {
    it('drops the categories, the search and the sort together', async () => {
      await setUp();
      component.toggleCategory('Dinner');
      component.searchInput = 'chicken';
      component.sortOption = 'time-desc';
      component.applyFilters();

      component.clearAll();

      expect(component.selectedCategories).toEqual([]);
      expect(component.searchInput).toBe('');
      expect(component.sortOption).toBe('featured');
      expect(component.selectedRecipes.length).toBe(4);
      expect(component.hasActiveFilters).toBe(false);
      expect(component.hasActiveSort).toBe(false);
    });
  });

  describe('url round-trip', () => {
    it('seeds the filters from the query string', async () => {
      await setUp({ category: 'Dinner,Italian', search: 'lasagne', sort: 'time-asc' });

      expect(component.selectedCategories).toEqual(['Dinner', 'Italian']);
      expect(component.searchInput).toBe('lasagne');
      expect(component.sortOption).toBe('time-asc');
      expect(names()).toEqual(['Lasagne']);
    });

    it('expands the category panel when arriving on a category link', async () => {
      await setUp({ category: 'Dinner' });
      expect(component.filtersShowing).toBe(true);
    });

    it('leaves the panel collapsed with no category in the url', async () => {
      await setUp();
      expect(component.filtersShowing).toBe(false);
    });

    it('ignores a sort value it does not recognise', async () => {
      await setUp({ sort: 'nonsense' });
      expect(component.sortOption).toBe('featured');
    });

    it('writes the active filters back to the url', async () => {
      await setUp();
      component.toggleCategory('Dinner');
      component.searchInput = 'chicken';
      component.sortOption = 'time-asc';
      component.applyFilters();

      expect(queryParams['category']).toBe('Dinner');
      expect(queryParams['search']).toBe('chicken');
      expect(queryParams['sort']).toBe('time-asc');
    });

    it('clears the params rather than leaving them empty', async () => {
      await setUp({ category: 'Dinner' });
      component.clearAll();

      expect(queryParams['category']).toBeNull();
      expect(queryParams['search']).toBeNull();
      expect(queryParams['sort']).toBeNull();
    });
  });

  describe('result summary', () => {
    it('uses the singular for one result', async () => {
      await setUp();
      component.searchInput = 'lasagne';
      component.applyFilters();

      expect(component.resultSummary).toContain('1 recipe');
      expect(component.resultSummary).not.toContain('1 recipes');
    });

    it('names the active categories and the search term', async () => {
      await setUp();
      component.toggleCategory('Dinner');
      component.toggleCategory('Italian');
      component.searchInput = 'lasagne';
      component.applyFilters();

      expect(component.resultSummary).toBe('Showing 1 recipe in Dinner or Italian matching "lasagne"');
    });
  });
});
