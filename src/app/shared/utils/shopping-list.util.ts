import { Recipe } from '../models/recipe.model';
import { IngredientSanitizerPipe } from '../pipes/single-quantity-check.pipe';
import { toAmountParts } from './ingredient-amount.util';

// The unit pipe is a class with one pure method, so it is reused here rather
// than re-implemented: a shopping list that said "2 cup" while the page beside
// it said "2 cups" would be the same bug fixed twice and then only once.
const units = new IngredientSanitizerPipe();

// The parenthesised abbreviation the pipe appends — "Cups (c)" — is for a page
// where there is room to teach it. On a shopping list it is noise.
function unitText(measurementType: string, amount: number, scale: number): string {
  if(!measurementType || measurementType === 'Count'){
    return '';
  }
  return units.transform(measurementType, amount, scale).replace(/\s*\(.*\)$/, '').toLowerCase();
}

/**
 * A recipe's ingredients as plain text, ready for the clipboard or a share
 * sheet, scaled to whatever the page is currently showing.
 *
 * Plain text on purpose. Everyone has somewhere to put it — Notes, a message to
 * whoever is passing the shop, a real paper list copied out by hand — and none
 * of those want a link back to a site they then have to load in an aisle.
 *
 * Group headings are kept when a recipe has more than one, because they are
 * usually "For the sauce" / "For the topping", which is genuinely how the
 * shopping splits up too.
 */
export function buildShoppingList(recipe: Recipe, scale: number = 1): string {
  const lines: string[] = [recipe.name];

  const servings = scaledServings(recipe, scale);
  if(servings){
    lines.push(`${servings} servings${scale !== 1 ? ` (recipe ×${formatScale(scale)})` : ''}`);
  }
  lines.push('');

  const groups = recipe.ingredient_groups || [];
  const named = groups.length > 1;

  for(const group of groups){
    if(named && group.ingredientGroupName){
      lines.push(`${group.ingredientGroupName}:`);
    }
    for(const ingredient of group.ingredients || []){
      lines.push('- ' + ingredientLine(ingredient, scale));
    }
    if(named){
      lines.push('');
    }
  }

  // The URL last, so it is there for whoever wants it without being the first
  // thing in the message.
  if(typeof location !== 'undefined'){
    lines.push(location.href);
  }

  // Collapses the blank line a trailing group leaves behind.
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function ingredientLine(
  ingredient: { ingredientName: string, ingredientAmount: number, ingredientMeasurementType: string },
  scale: number
): string {
  const amount = toAmountParts(ingredient.ingredientAmount, scale).text;
  const unit = unitText(ingredient.ingredientMeasurementType, ingredient.ingredientAmount, scale);
  return [amount, unit, ingredient.ingredientName].filter(part => part !== '').join(' ');
}

export function scaledServings(recipe: Recipe, scale: number): number | null {
  if(!recipe.serving_size){
    return null;
  }
  // Half of a five-serving recipe is two and a half, and "2.5 servings" reads
  // like a spreadsheet. Rounding to a whole is honest enough for a heading
  // whose job is to say roughly how many it now feeds.
  return Math.max(1, Math.round(recipe.serving_size * scale));
}

/** "1/2" rather than "0.5", to match how the rest of the page writes amounts. */
export function formatScale(scale: number): string {
  return toAmountParts(scale).text || String(scale);
}
