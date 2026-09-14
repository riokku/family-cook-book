import { Injectable } from '@angular/core';

/**
 * Smaller renditions of an uploaded recipe photo, when the storage backend can
 * produce them.
 *
 * Uploads are downscaled to 1600px on their longest edge, which is right for
 * the photo at the top of a recipe and about four times more than a card in a
 * three-across grid ever shows. On a phone that is the difference between a
 * grid that appears and one that fills in.
 *
 * Supabase can resize on the fly, but only on a paid plan, and a project
 * without it answers the resize endpoint with an error rather than the image.
 * A srcset is not a fallback chain — a browser that picks a candidate and gets
 * a 400 shows a broken image rather than trying the src — so nothing is
 * promised until one transformed URL has been fetched successfully. Until then,
 * and for ever on a project without the feature, the original is served exactly
 * as it is today.
 */
@Injectable({ providedIn: 'root' })
export class ImageVariantsService {

  private static readonly OBJECT_PATH = '/storage/v1/object/public/';
  private static readonly RENDER_PATH = '/storage/v1/render/image/public/';

  // The widths a card is actually asked to fill, across the grid's breakpoints.
  private static readonly WIDTHS = [400, 600, 900];

  private available: boolean = false;
  private probe: Promise<boolean> | null = null;

  /** Whether resizing has been confirmed to work on this project. */
  get isAvailable(): boolean {
    return this.available;
  }

  /**
   * A srcset for this image, or null when there is nothing safe to offer —
   * the URL is not a storage object, or resizing has not been confirmed.
   */
  srcsetFor(url: string | null | undefined): string | null {
    if(!this.available || !this.canTransform(url)){
      return null;
    }
    return ImageVariantsService.WIDTHS
      .map(width => `${this.variant(url, width)} ${width}w`)
      .join(', ');
  }

  /**
   * Checks the resize endpoint once per session against a real image.
   *
   * Resolves to false on any failure, which is the quiet path: an unavailable
   * feature should cost one request and then never be mentioned again.
   */
  checkAvailability(sampleUrl: string | null | undefined): Promise<boolean> {
    if(this.probe){
      return this.probe;
    }
    if(!this.canTransform(sampleUrl)){
      return Promise.resolve(false);
    }

    this.probe = fetch(this.variant(sampleUrl, ImageVariantsService.WIDTHS[0]), { method: 'GET' })
      .then(response => {
        this.available = response.ok;
        return this.available;
      })
      .catch(() => {
        this.available = false;
        return false;
      });

    return this.probe;
  }

  private canTransform(url: string | null | undefined): url is string {
    return !!url && url.includes(ImageVariantsService.OBJECT_PATH);
  }

  private variant(url: string, width: number): string {
    const base = url.replace(ImageVariantsService.OBJECT_PATH, ImageVariantsService.RENDER_PATH);
    // 75 is where a downscaled JPEG stops looking obviously compressed at card
    // size while still being a fraction of the original's weight.
    return `${base}?width=${width}&quality=75`;
  }

}
