import { IngredientAmountConverterPipe } from './ingredient-amount-converter.pipe';

describe('IngredientAmountConverterPipe', () => {

  let pipe: IngredientAmountConverterPipe;

  beforeEach(() => {
    pipe = new IngredientAmountConverterPipe();
  });

  describe('the fractions the forms store', () => {
    // Both roundings of the repeating thirds are in the recipe data, because
    // the amount is whatever the person adding the recipe typed.
    const cases: [number, string][] = [
      [0.125, '1/8'],
      [0.25,  '1/4'],
      [0.33,  '1/3'],
      [0.34,  '1/3'],
      [0.375, '3/8'],
      [0.5,   '1/2'],
      [0.625, '5/8'],
      [0.66,  '2/3'],
      [0.67,  '2/3'],
      [0.75,  '3/4'],
      [0.875, '7/8']
    ];

    cases.forEach(([amount, expected]) => {
      it(`writes ${amount} as ${expected}`, () => {
        expect(pipe.transform(amount, false)).toBe(expected);
      });
    });
  });

  describe('whole numbers', () => {
    it('leaves a whole number alone', () => {
      expect(pipe.transform(3, false)).toBe('3');
    });

    it('keeps a large whole number intact', () => {
      expect(pipe.transform(250, false)).toBe('250');
    });

    it('leaves zero as zero', () => {
      expect(pipe.transform(0, false)).toBe('0');
    });
  });

  describe('mixed numbers', () => {
    it('writes 1.5 as a whole and a fraction', () => {
      expect(pipe.transform(1.5, false)).toBe('1 1/2');
    });

    it('writes 1.67 as 1 2/3', () => {
      expect(pipe.transform(1.67, false)).toBe('1 2/3');
    });

    it('writes 4.75 as 4 3/4', () => {
      expect(pipe.transform(4.75, false)).toBe('4 3/4');
    });

    // The old pipe matched "0.5" inside the digits of "10.5" and wrote 11/2.
    it('does not read the fraction out of the whole part', () => {
      expect(pipe.transform(10.5, false)).toBe('10 1/2');
      expect(pipe.transform(20.5, false)).toBe('20 1/2');
    });
  });

  describe('doubling', () => {
    const cases: [number, string][] = [
      [0.125, '1/4'],
      [0.25,  '1/2'],
      [0.33,  '2/3'],
      [0.5,   '1'],
      [0.66,  '1 1/3'],
      [0.67,  '1 1/3'],
      [0.75,  '1 1/2'],
      [1.5,   '3'],
      [2,     '4'],
      [10.5,  '21']
    ];

    cases.forEach(([amount, expected]) => {
      it(`doubles ${amount} to ${expected}`, () => {
        expect(pipe.transform(amount, true)).toBe(expected);
      });
    });

    it('leaves the amount alone when not doubling', () => {
      expect(pipe.transform(0.33, false)).toBe('1/3');
    });

    it('treats a missing flag as not doubled', () => {
      expect(pipe.transform(0.33, undefined)).toBe('1/3');
    });
  });

  describe('amounts with no tidy fraction', () => {
    it('keeps a decimal that is not close to a kitchen fraction', () => {
      expect(pipe.transform(0.6, false)).toBe('0.6');
    });

    it('does not force 0.7 into 2/3', () => {
      expect(pipe.transform(0.7, false)).toBe('0.7');
    });

    it('keeps floating point noise off the page', () => {
      expect(pipe.transform(0.1 * 3, false)).toBe('0.3');
    });
  });

  describe('missing amounts', () => {
    // A step ingredient may be named without an amount, and null * 2 is 0 —
    // so a doubled blank must not turn into a zero.
    it('renders nothing for null', () => {
      expect(pipe.transform(null, false)).toBe('');
      expect(pipe.transform(null, true)).toBe('');
    });

    it('renders nothing for undefined', () => {
      expect(pipe.transform(undefined, false)).toBe('');
    });

    it('renders nothing for a value that is not a number', () => {
      expect(pipe.transform(NaN, false)).toBe('');
    });
  });

  describe('amounts arriving as strings', () => {
    it('reads a decimal string', () => {
      expect(pipe.transform('0.67', false)).toBe('2/3');
    });

    it('renders nothing for an empty string', () => {
      expect(pipe.transform('', false)).toBe('');
    });

    it('renders nothing for text that is not a number', () => {
      expect(pipe.transform('a pinch', false)).toBe('');
    });
  });

  describe('fraction form', () => {
    it('writes the coarsest denominator that fits', () => {
      expect(pipe.transform(0.5, false)).toBe('1/2');
      expect(pipe.transform(2.5, false)).toBe('2 1/2');
    });

    it('rounds a near-whole remainder up to the next whole', () => {
      expect(pipe.transform(0.99, false)).toBe('1');
      expect(pipe.transform(2.99, false)).toBe('3');
    });
  });

});
