// What we ask the model for, and the two ways of asking.
//
// A photo and a web page are very different inputs, but they have to come back
// as the same object: the add-recipe form on the other end only knows how to
// fill itself from one shape. So the schema and most of the rules are shared,
// and each source adds only the rules peculiar to reading it.

import type { DistilledPage } from './page.ts';

export const VALID_UNITS = [
  'Cups', 'Teaspoons', 'Tablespoons', 'Fluid ounces', 'Pints',
  'Quarts', 'Milliliters', 'Liters', 'Grams', 'Kilograms',
  'Ounces', 'Pounds', 'Count'
];

export const VALID_TAGS = [
  'Appetizer', 'Dinner', 'Cast iron', 'Beverage', 'Breakfast',
  'Dessert', 'Cookies', 'Grilling', 'Italian', 'Mexican',
  'Salad', 'Seafood', 'Soup'
];

const RECIPE_SCHEMA = `{
  "name": "recipe name",
  "description": "a brief 1-2 sentence description of the dish",
  "author": "author or source if visible, otherwise empty string",
  "prep_time": <number in minutes, or null>,
  "cook_time": <number in minutes, or null>,
  "chill_time": <number in minutes, or null>,
  "total_time": <number in minutes, or null>,
  "serving_size": <number, or null>,
  "ingredient_groups": [
    {
      "ingredientGroupName": "group label (use 'Main' if there is no group label)",
      "ingredients": [
        {
          "ingredientName": "ingredient name",
          "ingredientAmount": <number>,
          "ingredientMeasurementType": "<one value from the allowed units list>"
        }
      ]
    }
  ],
  "steps": [
    { "step": "full step text", "stepIngredients": [] }
  ],
  "tags": ["tag1"],
  "notes": "any tips or notes from the recipe, or empty string"
}`;

/**
 * The rules both sources share. `missingValueRule` is a parameter because how
 * you say "this wasn't there" differs between a photo and a page, and the
 * phrasing is what stops the model filling gaps from its own imagination.
 */
function sharedRules(missingValueRule: string): string[] {
  return [
    `ingredientMeasurementType MUST be exactly one of: ${VALID_UNITS.join(', ')}`,
    'Use "Count" for whole items without a unit (e.g. 2 eggs, 3 cloves of garlic)',
    `tags MUST only contain values from: ${VALID_TAGS.join(', ')}`,
    'All times must be plain integers in minutes',
    missingValueRule,
    'If the recipe has distinct ingredient sections (e.g. "Sauce", "Dough"), create one group per section'
  ];
}

function assemble(intro: string, rules: string[], source = ''): string {
  return `${intro}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation — with exactly this structure:
${RECIPE_SCHEMA}

Rules:
${rules.map(rule => `- ${rule}`).join('\n')}${source}`;
}

export function buildImagePrompt(): string {
  return assemble(
    'You are a recipe extraction assistant. Analyze this recipe image and extract all information into a structured JSON object.',
    sharedRules('If a value is not visible or not applicable, use null for numbers and "" for strings')
  );
}

export function buildPagePrompt(page: DistilledPage): string {
  const rules = [
    ...sharedRules('If a value is not on the page or not applicable, use null for numbers and "" for strings'),
    'Convert ISO 8601 durations such as "PT1H30M" to whole minutes (90)',
    'Reduce fractions, ranges and mixed numbers to a single decimal: "1 1/2" is 1.5, "2-3" is 2',
    'Strip leading numbering such as "1." or "Step 2:" from each step, but keep the step text whole',
    'Ignore navigation, adverts, newsletter prompts, comments, related recipes, and anything else on the page that is not this recipe',
    'author is the recipe author if the page names one, otherwise the name of the site',
    'Do not carry any HTML or markdown into the values — plain text only'
  ];

  const label = page.format === 'json-ld'
    ? 'the structured recipe data the page publishes'
    : 'the text of the page';

  return assemble(
    'You are a recipe extraction assistant. Read the recipe below, taken from a web page, and extract it into a structured JSON object.',
    rules,
    `\n\nHere is ${label} at ${page.sourceUrl}:\n\n${page.content}`
  );
}
