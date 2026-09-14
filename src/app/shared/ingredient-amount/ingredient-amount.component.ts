import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { AmountParts, toAmountParts } from '../utils/ingredient-amount.util';

// An ingredient amount set as a real fraction: the numerator raised over a
// lowered denominator, with a gap holding it off the whole number.
//
// Written flat, a mixed number runs its two halves together — "1 1/2" reads as
// "11/2" at list size, which is a bad way to find out how much flour to use.
// Setting the fraction smaller and stacked separates it from the whole number
// by shape rather than by a space that the eye closes up anyway.
//
// The digits are ordinary ones rather than the ready-made fraction characters
// (1/2, 1/3 and so on): Poppins carries only halves and quarters of those, so
// thirds, sixths and eighths would each fall back to whatever font the browser
// reached for next and land in the middle of a list set in Poppins.
@Component({
  selector: 'app-ingredient-amount',
  templateUrl: './ingredient-amount.component.html',
  styleUrls: ['./ingredient-amount.component.scss'],
  standalone: false
})
export class IngredientAmountComponent implements OnChanges {

  @Input() amount: number | string | null | undefined;
  // What the recipe is being multiplied by: 0.5 for half, 2 for double. 1 is
  // the recipe as it was written down.
  @Input() scale: number = 1;

  parts: AmountParts = { text: '', whole: '', numerator: null, denominator: null };

  // Read out, a stacked fraction becomes "1 superscript one fraction-slash
  // subscript two", so the whole thing is announced as a single label saying
  // "1 1/2" instead.
  //
  // A label rather than a second copy of the text hidden off-screen: that copy
  // is still part of the document, so selecting an ingredient would put both
  // forms on the clipboard — "1 1/211/2 cups".
  @HostBinding('attr.role') hostRole: string | null = null;
  @HostBinding('attr.aria-label') hostLabel: string | null = null;

  ngOnChanges(): void {
    this.parts = toAmountParts(this.amount, this.scale);
    this.hostRole = this.parts.text ? 'img' : null;
    this.hostLabel = this.parts.text || null;
  }

}
