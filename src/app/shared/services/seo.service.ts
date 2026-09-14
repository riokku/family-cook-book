import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Recipe } from '../models/recipe.model';

/**
 * The description, the share card and the structured data for a page.
 *
 * Two audiences, and they behave differently:
 *
 * - Search engines. Googlebot renders JavaScript, so the tags this sets at
 *   runtime are seen, and the Recipe JSON-LD is what earns a result with the
 *   photo, the rating slot and the cook time rather than a line of text.
 * - Chat apps. The crawlers behind iMessage, WhatsApp, Facebook and Slack do
 *   NOT run JavaScript. They read the HTML as served, which for this app is the
 *   same empty index.html for every route — so a recipe pasted into a group
 *   chat gets the site-wide card from index.html, not its own. Fixing that
 *   properly needs the routes prerendered at build time; the tags here are what
 *   makes that worth doing, because prerendering picks up whatever the page
 *   sets.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {

  private static readonly SITE_NAME = "Gogo's Kitchen";
  private static readonly JSON_LD_ID = 'recipe-structured-data';

  constructor(
    private title: Title,
    private meta: Meta
  ){}

  /** A plain page: a title, a description and a matching share card. */
  setPage(pageTitle: string, description: string, image?: string): void {
    const fullTitle = `${SeoService.SITE_NAME} | ${pageTitle}`;
    this.title.setTitle(fullTitle);
    this.applyTags(fullTitle, description, image, 'website');
    this.clearStructuredData();
  }

  /** A recipe: the same tags, plus the structured data a search result needs. */
  setRecipe(recipe: Recipe): void {
    const fullTitle = `${SeoService.SITE_NAME} | ${recipe.name}`;
    this.title.setTitle(fullTitle);
    this.applyTags(fullTitle, this.summarise(recipe), recipe.image_path, 'article');
    this.setStructuredData(this.toRecipeSchema(recipe));
  }

  private applyTags(title: string, description: string, image: string | undefined, type: string): void {
    const url = typeof location === 'undefined' ? '' : location.href;
    const absoluteImage = this.absolute(image);

    // updateTag rather than addTag: routing through the app calls this again
    // for every page, and addTag would leave a trail of stale descriptions.
    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:site_name', content: SeoService.SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: type });
    if(url){
      this.meta.updateTag({ property: 'og:url', content: url });
    }

    // Twitter reads og: for most of this, but not the card type — without it
    // the link renders as a small thumbnail beside the text rather than as the
    // large photo a recipe deserves.
    this.meta.updateTag({ name: 'twitter:card', content: absoluteImage ? 'summary_large_image' : 'summary' });

    if(absoluteImage){
      this.meta.updateTag({ property: 'og:image', content: absoluteImage });
      this.meta.updateTag({ name: 'twitter:image', content: absoluteImage });
    }else{
      // A card pointing at the previous page's photo is worse than one with no
      // photo at all.
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("name='twitter:image'");
    }
  }

  /** The recipe's own description, trimmed to what a share card will show. */
  private summarise(recipe: Recipe): string {
    const description = (recipe.description || '').trim();
    if(!description){
      return `${recipe.name} — a recipe from ${SeoService.SITE_NAME}.`;
    }
    if(description.length <= 200){
      return description;
    }
    // Cut at a word rather than mid-word, so the ellipsis follows a whole one.
    const clipped = description.slice(0, 200);
    const lastSpace = clipped.lastIndexOf(' ');
    return (lastSpace > 120 ? clipped.slice(0, lastSpace) : clipped).trimEnd() + '…';
  }

  /** Share crawlers reject a relative image path, so make it absolute. */
  private absolute(image: string | undefined): string | null {
    if(!image){
      return null;
    }
    if(/^https?:\/\//i.test(image)){
      return image;
    }
    if(typeof location === 'undefined'){
      return null;
    }
    return new URL(image.replace(/^\.?\//, ''), location.origin + '/').href;
  }

  private toRecipeSchema(recipe: Recipe): Record<string, unknown> {
    const ingredients = (recipe.ingredient_groups || []).flatMap(group =>
      (group.ingredients || []).map(ingredient => this.ingredientLine(ingredient))
    );

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: this.summarise(recipe),
      recipeIngredient: ingredients,
      recipeInstructions: (recipe.steps || []).map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step.step
      }))
    };

    if(recipe.author){
      schema['author'] = { '@type': 'Person', name: recipe.author };
    }
    if(recipe.image_path){
      schema['image'] = this.absolute(recipe.image_path);
    }
    if(recipe.serving_size){
      schema['recipeYield'] = `${recipe.serving_size} servings`;
    }
    if(recipe.tags?.length){
      schema['keywords'] = recipe.tags.join(', ');
      // The first tag is the closest thing the data has to a course.
      schema['recipeCategory'] = recipe.tags[0];
    }
    if(recipe.created){
      schema['datePublished'] = new Date(recipe.created).toISOString().slice(0, 10);
    }

    // Durations go in ISO 8601. Chill time has no field of its own in the
    // schema, so it is left to total time to account for it.
    this.addDuration(schema, 'prepTime', recipe.prep_time);
    this.addDuration(schema, 'cookTime', recipe.cook_time);
    this.addDuration(schema, 'totalTime', recipe.total_time);

    return schema;
  }

  private ingredientLine(ingredient: { ingredientName: string, ingredientAmount: number, ingredientMeasurementType: string }): string {
    const unit = ingredient.ingredientMeasurementType && ingredient.ingredientMeasurementType !== 'Count'
      ? ingredient.ingredientMeasurementType.toLowerCase()
      : '';
    // The stored decimal, not the stacked fraction: this line is parsed by a
    // machine, and "1 1/2" is ambiguous where 1.5 is not.
    return [ingredient.ingredientAmount, unit, ingredient.ingredientName]
      .filter(part => part !== null && part !== undefined && String(part).trim() !== '')
      .join(' ');
  }

  private addDuration(schema: Record<string, unknown>, key: string, minutes: number | undefined): void {
    if(!minutes || minutes <= 0){
      return;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    schema[key] = 'PT' + (hours ? `${hours}H` : '') + (remainder ? `${remainder}M` : '');
  }

  private setStructuredData(schema: Record<string, unknown>): void {
    const script = this.structuredDataElement() ?? this.createStructuredDataElement();
    script.textContent = JSON.stringify(schema);
  }

  private clearStructuredData(): void {
    this.structuredDataElement()?.remove();
  }

  private structuredDataElement(): HTMLScriptElement | null {
    return document.getElementById(SeoService.JSON_LD_ID) as HTMLScriptElement | null;
  }

  private createStructuredDataElement(): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = SeoService.JSON_LD_ID;
    document.head.appendChild(script);
    return script;
  }

}
