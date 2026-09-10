import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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

  beforeEach(async () => {
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
        { provide: ActivatedRoute, useValue: { params: of({ slug: 'test-recipe' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const supa = TestBed.inject(SupaService) as unknown as SupaServiceStub;
    supa.recipes = [makeRecipe({ name: 'Test recipe', slug: 'test-recipe' })];

    fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the recipe named by the route', () => {
    expect(component.recipe.slug).toBe('test-recipe');
  });
});
