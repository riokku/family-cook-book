import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { AddRecipeComponent } from './add-recipe.component';
import { SlugGeneratorPipe } from 'src/app/shared/pipes/slug-generator.pipe';
import { SupaService } from 'src/app/shared/services/supa.service';
import { AiService, ScannedRecipe } from 'src/app/shared/services/ai.service';
import { SupaServiceStub, AiServiceStub } from 'src/testing/test-doubles';

// A recipe as the importer hands it over: the model's fields, plus the source
// link and photo the edge function read off the page itself.
function importedRecipe(overrides: Partial<ScannedRecipe> = {}): ScannedRecipe {
  return {
    name: 'Lemon Drizzle Cake',
    description: 'A very lemony loaf.',
    author: 'Nan',
    prep_time: 20,
    cook_time: 45,
    chill_time: null,
    total_time: 65,
    serving_size: 8,
    ingredient_groups: [
      {
        ingredientGroupName: 'Cake',
        ingredients: [
          { ingredientName: 'Flour', ingredientAmount: 2, ingredientMeasurementType: 'Cups' }
        ]
      }
    ],
    steps: [{ step: 'Heat the oven.', stepIngredients: [] as [] }],
    tags: ['Dessert'],
    notes: '',
    link: 'https://example.test/lemon-drizzle',
    image_path: 'https://example.test/cake.jpg',
    ...overrides
  };
}

describe('AddRecipeComponent', () => {
  let component: AddRecipeComponent;
  let fixture: ComponentFixture<AddRecipeComponent>;
  let aiService: AiServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddRecipeComponent, SlugGeneratorPipe],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: SupaService, useClass: SupaServiceStub },
        { provide: AiService, useClass: AiServiceStub }
      ],
      // Child components and third-party elements are not under test here.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddRecipeComponent);
    component = fixture.componentInstance;
    aiService = TestBed.inject(AiService) as unknown as AiServiceStub;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Three controls sharing a row, each of which would otherwise size itself off
  // its own padding and line-height. Measured rather than asserted on the CSS,
  // because the heights are what the eye actually reads.
  it('renders the photo button, the URL field and the import button at one height', () => {
    const banner = fixture.nativeElement as HTMLElement;

    // Karma renders in a 735px window, where Bootstrap caps .container at 540px
    // and the row wraps. Widening it puts the three controls on one line, which
    // is the arrangement this is about.
    const container = banner.querySelector<HTMLElement>('.container');
    container.style.maxWidth = 'none';
    container.style.width = '1200px';

    const photoButton = banner.querySelector<HTMLElement>('.scan-banner__options > .btn-scan');
    const urlField = banner.querySelector<HTMLElement>('.scan-banner__url .form-control');
    const importButton = banner.querySelector<HTMLElement>('.scan-banner__url .btn-scan');

    expect(photoButton).withContext('photo button').toBeTruthy();
    expect(urlField).withContext('url field').toBeTruthy();
    expect(importButton).withContext('import button').toBeTruthy();

    const rects = [photoButton, urlField, importButton].map(el => el.getBoundingClientRect());

    expect(rects[0].height).toBeGreaterThan(0);
    expect(rects[1].height).withContext('url field height').toBe(rects[0].height);
    expect(rects[2].height).withContext('import button height').toBe(rects[0].height);

    // Equal heights are only half of it. A stray margin on one of them makes
    // its flex line taller than the row, and the others then centre against
    // that — same size, different line.
    expect(rects[1].top).withContext('url field top').toBe(rects[0].top);
    expect(rects[2].top).withContext('import button top').toBe(rects[0].top);
  });

  describe('importing from a URL', () => {
    it('fills the form, the slug, the source link and the photo', async () => {
      spyOn(aiService, 'extractRecipeFromUrl').and.resolveTo(importedRecipe() as never);
      component.importUrl = 'https://example.test/lemon-drizzle';

      await component.onImportFromUrl();

      expect(component.recipeForm.get('name').value).toBe('Lemon Drizzle Cake');
      expect(component.recipeForm.get('slug').value).toBe('lemon-drizzle-cake');
      expect(component.recipeForm.get('total_time').value).toBe(65);
      expect(component.recipeForm.get('link').value).toBe('https://example.test/lemon-drizzle');
      expect(component.recipeForm.get('image_path').value).toBe('https://example.test/cake.jpg');
      expect(component.imageSource).toBe('url');

      const groups = component.recipeForm.get('ingredient_groups') as FormArray;
      expect(groups.length).toBe(1);
      expect(groups.at(0).get('ingredientGroupName').value).toBe('Cake');
      expect((component.recipeForm.get('steps') as FormArray).length).toBe(1);

      expect(component.aiSuccess).toContain('imported');
      expect(component.aiError).toBeNull();
    });

    it('leaves the link and image alone when the page offered neither', async () => {
      spyOn(aiService, 'extractRecipeFromUrl').and.resolveTo(
        importedRecipe({ link: undefined, image_path: '' }) as never
      );
      component.recipeForm.get('link').setValue('https://typed-by-hand.test');
      component.importUrl = 'https://example.test/lemon-drizzle';

      await component.onImportFromUrl();

      expect(component.recipeForm.get('link').value).toBe('https://typed-by-hand.test');
      expect(component.imageSource).toBe('upload');
    });

    it('surfaces the reason an import failed', async () => {
      spyOn(aiService, 'extractRecipeFromUrl').and.rejectWith(
        new Error('The site returned 404 for that link.')
      );
      component.importUrl = 'https://example.test/gone';

      await component.onImportFromUrl();

      expect(component.aiError).toBe('The site returned 404 for that link.');
      expect(component.aiSuccess).toBeNull();
      expect(component.isImportingUrl).toBeFalse();
    });

    it('does nothing without a link to import', async () => {
      const importSpy = spyOn(aiService, 'extractRecipeFromUrl');
      component.importUrl = '   ';

      await component.onImportFromUrl();

      expect(importSpy).not.toHaveBeenCalled();
    });
  });
});
