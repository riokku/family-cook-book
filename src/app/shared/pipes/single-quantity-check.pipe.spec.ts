import { IngredientSanitizerPipe } from './single-quantity-check.pipe';

describe('IngredientSanitizerPipe', () => {

  let pipe: IngredientSanitizerPipe;

  beforeEach(() => {
    pipe = new IngredientSanitizerPipe();
  });

  describe('matching the unit to the amount beside it', () => {
    it('keeps a unit plural for more than one', () => {
      expect(pipe.transform('Cups', 2)).toBe('Cups');
    });

    it('drops the s for exactly one', () => {
      expect(pipe.transform('Cups', 1)).toBe('Cup');
    });

    it('drops the s for less than one', () => {
      expect(pipe.transform('Cups', 0.5)).toBe('Cup');
    });

    it('keeps a unit plural for a mixed number', () => {
      expect(pipe.transform('Cups', 1.5)).toBe('Cups');
    });
  });

  describe('when the page is showing doubled amounts', () => {
    // The number printed beside the unit is the doubled one, so the unit has
    // to agree with that rather than with the stored amount. Reading the
    // stored amount alone put "2 cup" on screen.
    it('pluralises a single unit that doubling takes past one', () => {
      expect(pipe.transform('Cups', 1, true)).toBe('Cups');
    });

    it('pluralises three quarters doubled to one and a half', () => {
      expect(pipe.transform('Cups', 0.75, true)).toBe('Cups');
    });

    it('leaves a half doubled to exactly one singular', () => {
      expect(pipe.transform('Cups', 0.5, true)).toBe('Cup');
    });

    it('leaves a third doubled to two thirds singular', () => {
      expect(pipe.transform('Cups', 0.33, true)).toBe('Cup');
    });

    it('treats a missing flag as not doubled', () => {
      expect(pipe.transform('Cups', 1)).toBe('Cup');
    });
  });

  describe('the short forms', () => {
    it('abbreviates a plural unit', () => {
      expect(pipe.transform('Tablespoons', 3)).toBe('Tablespoons (tbsp)');
    });

    it('abbreviates the singular it just trimmed', () => {
      expect(pipe.transform('Tablespoons', 1)).toBe('Tablespoon (tbsp)');
    });

    it('abbreviates a unit the doubling pluralised', () => {
      expect(pipe.transform('Teaspoons', 1, true)).toBe('Teaspoons (tsp)');
    });

    it('handles the two word units', () => {
      expect(pipe.transform('Fluid ounces', 2)).toBe('Fluid ounces (fl oz)');
      expect(pipe.transform('Fluid ounces', 1)).toBe('Fluid ounce (fl oz)');
    });

    // Cups is the one unit the form offers that the table has no short form
    // for, so it comes back bare where every other unit carries one.
    it('leaves cups without a short form', () => {
      expect(pipe.transform('Cups', 2)).toBe('Cups');
    });

    it('leaves a unit it does not know alone', () => {
      expect(pipe.transform('Pinches', 2)).toBe('Pinches');
    });
  });

});
