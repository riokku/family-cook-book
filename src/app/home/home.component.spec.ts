import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule, provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { SupaService } from 'src/app/shared/services/supa.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { SupaServiceStub, makeRecipe } from 'src/testing/test-doubles';
import { Recipe } from 'src/app/shared/models/recipe.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  async function create(recipes: Recipe[] = []) {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      // SharedModule provides the timeFormat pipe and the photo; RouterModule the links.
      imports: [SharedModule, RouterModule],
      providers: [
        provideRouter([]),
        { provide: SupaService, useClass: SupaServiceStub }
      ],
      // Child components and third-party elements are not under test here.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    (TestBed.inject(SupaService) as unknown as SupaServiceStub).recipes = recipes;
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await create();
    expect(component).toBeTruthy();
  });

  describe("today's special", () => {
    it('is empty when there are no recipes', async () => {
      await create();
      expect(component.todaysSpecial).toBeNull();
    });

    it('is always one of the featured recipes when any are featured', async () => {
      const featured = [
        makeRecipe({ slug: 'a', featured: true }),
        makeRecipe({ slug: 'b', featured: true })
      ];
      await create([makeRecipe({ slug: 'plain' }), ...featured]);
      expect(featured).toContain(component.todaysSpecial!);
    });

    it('falls back to any recipe when none are featured', async () => {
      const only = makeRecipe({ slug: 'only' });
      await create([only]);
      expect(component.todaysSpecial).toBe(only);
    });

    it('is shown on the tent card, linking to the recipe', async () => {
      await create([makeRecipe({ slug: 'cookies', name: 'Cookies', featured: true })]);
      const card: HTMLAnchorElement = fixture.nativeElement.querySelector('.special-card');
      expect(card.textContent).toContain('Cookies');
      expect(card.getAttribute('href')).toBe('/recipes/cookies');
    });
  });

  it('keeps the Surprise me button disabled until there are recipes', async () => {
    await create();
    const bell: HTMLButtonElement = fixture.nativeElement.querySelector('.cta-bell');
    expect(bell.disabled).toBeTrue();
  });
});
