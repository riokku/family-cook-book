import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RecipeCardComponent } from './recipe-card.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { makeRecipe } from 'src/testing/test-doubles';

describe('RecipeCardComponent', () => {
  let component: RecipeCardComponent;
  let fixture: ComponentFixture<RecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // SharedModule declares the card and the timeFormat pipe its template uses.
      imports: [SharedModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeCardComponent);
    component = fixture.componentInstance;
    component.recipe = makeRecipe();
    component.index = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('images', () => {
    it('uses the recipe image when there is one', () => {
      expect(component.imageSource).toBe('https://example.test/image.jpg');
    });

    it('falls back to the placeholder when image_path is missing', () => {
      component.recipe = makeRecipe({ image_path: undefined });
      expect(component.imageSource).toBe(component.placeholderImage);
    });

    it('swaps a broken image for the placeholder', () => {
      const img = { src: 'https://example.test/gone.jpg' } as HTMLImageElement;
      component.onImageError({ target: img } as unknown as Event);
      expect(img.src).toBe(component.placeholderImage);
    });

    it('does not loop when the placeholder itself fails', () => {
      const img = { src: component.placeholderImage } as HTMLImageElement;
      component.onImageError({ target: img } as unknown as Event);
      expect(img.src).toBe(component.placeholderImage);
    });

    it('eager-loads the first cards and defers the rest', () => {
      component.index = 0;
      expect(component.imageLoading).toBeNull();
      component.index = 2;
      expect(component.imageLoading).toBeNull();
      component.index = 3;
      expect(component.imageLoading).toBe('lazy');
    });
  });

  describe('tags', () => {
    it('reports a tag as active only when the host is filtering on it', () => {
      component.activeTags = ['Dinner'];
      expect(component.isTagActive('Dinner')).toBe(true);
      expect(component.isTagActive('Dessert')).toBe(false);
    });

    it('labels a tag by what activating it will do', () => {
      component.activeTags = ['Dinner'];
      expect(component.tagLabel('Dinner')).toBe('Remove Dinner filter');
      expect(component.tagLabel('Dessert')).toBe('Filter by Dessert');
    });

    it('emits the tag it was given', () => {
      const emitted: string[] = [];
      component.tagSelected.subscribe(tag => emitted.push(tag));
      component.onTagClick('Dinner');
      expect(emitted).toEqual(['Dinner']);
    });
  });
});
