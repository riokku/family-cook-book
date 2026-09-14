import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { RecipeComponent } from './recipe.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IngredientAmountConverterPipe } from 'src/app/shared/pipes/ingredient-amount-converter.pipe';
import { LowerFirstLetterPipe } from 'src/app/shared/pipes/lower-first-letter.pipe';
import { IngredientSanitizerPipe } from 'src/app/shared/pipes/single-quantity-check.pipe';
import { SupaService } from 'src/app/shared/services/supa.service';
import { makeRecipe, SupaServiceStub } from 'src/testing/test-doubles';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let fixture: ComponentFixture<RecipeComponent>;
  // The scale lives in the query string, so it has to be pushable from a test.
  let queryParams: BehaviorSubject<Record<string, string>>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject<Record<string, string>>({});

    await TestBed.configureTestingModule({
      declarations: [
        RecipeComponent,
        IngredientAmountConverterPipe,
        LowerFirstLetterPipe,
        IngredientSanitizerPipe
      ],
      imports: [SharedModule],
      providers: [
        { provide: SupaService, useClass: SupaServiceStub },
        // The component reads :slug from the route and looks the recipe up, so
        // the route has to name a recipe the service actually holds.
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ slug: 'test-recipe' }),
            queryParams: queryParams.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const supa = TestBed.inject(SupaService) as unknown as SupaServiceStub;
    supa.recipes = [makeRecipe({
      name: 'Test recipe',
      slug: 'test-recipe',
      serving_size: 4,
      steps: [{ step: 'Simmer for 20 minutes.' }, { step: 'Serve.' }]
    })];

    // Anything already checked off from an earlier spec would carry over: the
    // progress store is a real one, keyed by slug.
    localStorage.clear();

    fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the recipe named by the route', () => {
    expect(component.recipe.slug).toBe('test-recipe');
  });

  describe('scaling', () => {
    it('cooks the recipe as written by default', () => {
      expect(component.scale).toBe(1);
      expect(component.isScaled).toBe(false);
      expect(component.servings).toBe(4);
    });

    it('takes the scale from the query string', () => {
      queryParams.next({ scale: '2' });
      expect(component.scale).toBe(2);
      expect(component.servings).toBe(8);
    });

    it('rounds a halved serving count to something sayable', () => {
      queryParams.next({ scale: '0.5' });
      expect(component.servings).toBe(2);
    });

    // A mangled link should render the recipe, not a page of amounts nobody
    // can measure.
    it('ignores a scale it does not offer', () => {
      queryParams.next({ scale: '0.37' });
      expect(component.scale).toBe(1);
    });

    it('writes the scale as a fraction rather than a decimal', () => {
      expect(component.scaleLabel(0.5)).toBe('1/2');
    });
  });

  describe('checking things off', () => {
    it('starts with nothing checked', () => {
      expect(component.checkedCount).toBe(0);
    });

    it('remembers a checked step', () => {
      component.toggleStep(0);
      expect(component.isStepChecked(0)).toBe(true);
      expect(component.checkedCount).toBe(1);
    });

    it('unchecks on a second press', () => {
      component.toggleStep(0);
      component.toggleStep(0);
      expect(component.isStepChecked(0)).toBe(false);
    });

    // The same ingredient can appear in two groups, and crossing one off must
    // not cross off the other.
    it('keys ingredients by their position, not their name', () => {
      component.toggleIngredient(0, 1);
      expect(component.isIngredientChecked(0, 1)).toBe(true);
      expect(component.isIngredientChecked(1, 1)).toBe(false);
    });

    it('clears everything at once', () => {
      component.toggleStep(0);
      component.toggleIngredient(0, 0);
      component.resetProgress();
      expect(component.checkedCount).toBe(0);
    });

    it('survives the page being rebuilt', () => {
      component.toggleStep(1);

      const second = TestBed.createComponent(RecipeComponent);
      second.detectChanges();

      expect(second.componentInstance.isStepChecked(1)).toBe(true);
    });
  });

  describe('the shopping list', () => {
    it('lists the ingredients at the scale on screen', () => {
      const supa = TestBed.inject(SupaService) as unknown as SupaServiceStub;
      supa.recipes = [makeRecipe({
        slug: 'test-recipe',
        ingredient_groups: [{
          ingredientGroupName: 'Main',
          ingredients: [
            { ingredientName: 'Flour', ingredientAmount: 1.5, ingredientMeasurementType: 'Cups' }
          ]
        }]
      })];

      const scaled = TestBed.createComponent(RecipeComponent);
      scaled.detectChanges();
      queryParams.next({ scale: '2' });

      expect(scaled.componentInstance.shoppingListText).toContain('3 cups Flour');
    });
  });
});
