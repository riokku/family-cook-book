import { Component, Input, OnChanges } from '@angular/core';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { ImageVariantsService } from 'src/app/shared/services/image-variants.service';

/**
 * A recipe's photo, with the same fallbacks the recipe card uses: the
 * placeholder when there is no image or it fails to load, and a srcset only
 * once smaller renditions are known to exist.
 *
 * Used for the round photos on the home page (the cake stand and the plates in
 * the display case), which are cropped by their frame rather than shown at
 * 16:9, so the caller sizes and shapes the host.
 */
@Component({
  selector: 'app-recipe-photo',
  template: `<img [src]="imageSource" [alt]="alt" [attr.loading]="lazy ? 'lazy' : null"
    [attr.srcset]="srcset" [attr.sizes]="srcset ? sizes : null"
    decoding="async" (error)="onImageError($event)">`,
  styles: [`
    :host{ display: block; overflow: hidden; }
    img{ display: block; width: 100%; height: 100%; object-fit: cover; }
  `],
  standalone: false
})
export class RecipePhotoComponent implements OnChanges {
  @Input() recipe: Recipe;
  /** Empty by default: every caller names the recipe in text right beside it. */
  @Input() alt: string = '';
  @Input() lazy: boolean = false;
  /** How wide the photo is drawn, for choosing from the srcset. */
  @Input() sizes: string = '200px';

  readonly placeholderImage: string = 'assets/images/recipe-placeholder.svg';

  srcset: string | null = null;

  constructor(private imageVariants: ImageVariantsService){}

  ngOnChanges(): void {
    this.srcset = null;
    const path = this.recipe?.image_path;
    this.imageVariants.checkAvailability(path).then(available => {
      if(available && path === this.recipe?.image_path){
        this.srcset = this.imageVariants.srcsetFor(path);
      }
    });
  }

  get imageSource(): string {
    return this.recipe?.image_path || this.placeholderImage;
  }

  onImageError(event: Event){
    const img = event.target as HTMLImageElement;
    // A failed resize should cost the smaller file, not the photo.
    if(this.srcset && img.srcset){
      this.srcset = null;
      img.srcset = '';
      return;
    }
    if(!img.src.endsWith(this.placeholderImage)){
      img.src = this.placeholderImage;
    }
  }
}
