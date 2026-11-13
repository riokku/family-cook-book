import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePhotoComponent } from './recipe-photo.component';
import { makeRecipe } from 'src/testing/test-doubles';

describe('RecipePhotoComponent', () => {
  let component: RecipePhotoComponent;
  let fixture: ComponentFixture<RecipePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipePhotoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipePhotoComponent);
    component = fixture.componentInstance;
    component.recipe = makeRecipe();
    fixture.detectChanges();
  });

  it('uses the recipe image when there is one', () => {
    expect(component.imageSource).toBe('https://example.test/image.jpg');
  });

  it('falls back to the placeholder when image_path is missing', () => {
    component.recipe = makeRecipe({ image_path: undefined });
    expect(component.imageSource).toBe(component.placeholderImage);
  });

  it('is decorative unless told otherwise', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('swaps a broken image for the placeholder, once', () => {
    const img = { src: 'https://example.test/gone.jpg' } as HTMLImageElement;
    component.onImageError({ target: img } as unknown as Event);
    expect(img.src).toBe(component.placeholderImage);
    component.onImageError({ target: img } as unknown as Event);
    expect(img.src).toBe(component.placeholderImage);
  });
});
