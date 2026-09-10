import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

import { FeaturedRecipesComponent } from './featured-recipes.component';
import { SupaService } from 'src/app/shared/services/supa.service';
import { SupaServiceStub } from 'src/testing/test-doubles';

describe('FeaturedRecipesComponent', () => {
  let component: FeaturedRecipesComponent;
  let fixture: ComponentFixture<FeaturedRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturedRecipesComponent],
      providers: [
        provideRouter([]),
        { provide: SupaService, useClass: SupaServiceStub }
      ],
      // Child components and third-party elements are not under test here.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
