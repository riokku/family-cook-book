import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { RecipeEditComponent } from './recipe-edit.component';
import { SupaService } from 'src/app/shared/services/supa.service';
import { makeRecipe, SupaServiceStub } from 'src/testing/test-doubles';

describe('RecipeEditComponent', () => {
  let component: RecipeEditComponent;
  let fixture: ComponentFixture<RecipeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipeEditComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: SupaService, useClass: SupaServiceStub },
        // Without a :slug the component never builds its form, and the
        // formGroup binding in the template throws.
        { provide: ActivatedRoute, useValue: { params: of({ slug: 'test-recipe' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const supa = TestBed.inject(SupaService) as unknown as SupaServiceStub;
    supa.recipes = [makeRecipe({ name: 'Test recipe', slug: 'test-recipe' })];

    fixture = TestBed.createComponent(RecipeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
