import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedRecipesComponent } from './featured-recipes.component';

describe('FeaturedRecipesComponent', () => {
  let component: FeaturedRecipesComponent;
  let fixture: ComponentFixture<FeaturedRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturedRecipesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
