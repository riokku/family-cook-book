import { toAmountParts } from './ingredient-amount.util';

describe('toAmountParts', () => {

  describe('splitting a mixed number', () => {
    it('separates the whole from the fraction', () => {
      expect(toAmountParts(1.5)).toEqual({ text: '1 1/2', whole: '1', numerator: 1, denominator: 2 });
    });

    it('keeps a two digit whole part whole', () => {
      expect(toAmountParts(10.5)).toEqual({ text: '10 1/2', whole: '10', numerator: 1, denominator: 2 });
    });

    it('separates a doubled third', () => {
      expect(toAmountParts(0.67, true)).toEqual({ text: '1 1/3', whole: '1', numerator: 1, denominator: 3 });
    });
  });

  describe('a fraction on its own', () => {
    // No whole part, so the component leaves off the gap it would otherwise
    // set between the two.
    it('leaves the whole part empty', () => {
      expect(toAmountParts(0.67)).toEqual({ text: '2/3', whole: '', numerator: 2, denominator: 3 });
    });

    it('reduces to the coarsest denominator', () => {
      expect(toAmountParts(0.5)).toEqual({ text: '1/2', whole: '', numerator: 1, denominator: 2 });
    });
  });

  describe('amounts with no fraction to set', () => {
    it('reports a whole number with no numerator', () => {
      expect(toAmountParts(3)).toEqual({ text: '3', whole: '3', numerator: null, denominator: null });
    });

    it('reports an awkward decimal with no numerator', () => {
      expect(toAmountParts(0.6)).toEqual({ text: '0.6', whole: '0.6', numerator: null, denominator: null });
    });

    it('rounds a near whole remainder up', () => {
      expect(toAmountParts(0.99)).toEqual({ text: '1', whole: '1', numerator: null, denominator: null });
    });
  });

  describe('nothing to show', () => {
    const empty = { text: '', whole: '', numerator: null, denominator: null };

    it('returns empty parts for null, doubled or not', () => {
      expect(toAmountParts(null)).toEqual(empty);
      expect(toAmountParts(null, true)).toEqual(empty);
    });

    it('returns empty parts for undefined', () => {
      expect(toAmountParts(undefined)).toEqual(empty);
    });

    it('returns empty parts for text that is not a number', () => {
      expect(toAmountParts('a pinch')).toEqual(empty);
    });
  });

  describe('the flat text form', () => {
    // What a screen reader is given, and what the pipe hands back.
    it('spaces the whole and the fraction apart', () => {
      expect(toAmountParts(1.25).text).toBe('1 1/4');
    });

    it('matches the parts it reports', () => {
      const parts = toAmountParts(2.75);
      expect(parts.text).toBe(parts.whole + ' ' + parts.numerator + '/' + parts.denominator);
    });
  });

});
