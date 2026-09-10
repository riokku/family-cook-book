import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { AddRecipeComponent } from './add-recipe.component';
import { SlugGeneratorPipe } from 'src/app/shared/pipes/slug-generator.pipe';
import { SupaService } from 'src/app/shared/services/supa.service';
import { AiService } from 'src/app/shared/services/ai.service';
import { SupaServiceStub, AiServiceStub } from 'src/testing/test-doubles';

describe('AddRecipeComponent', () => {
  let component: AddRecipeComponent;
  let fixture: ComponentFixture<AddRecipeComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
