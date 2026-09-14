import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngredientAmountComponent } from './ingredient-amount.component';

// Mirrors how the ingredients list uses it, so the spacing between the amount
// and its unit is covered by a test rather than by hoping: Angular strips
// whitespace-only text nodes between elements, and swapping an interpolation
// for a component is exactly the change that can turn "1 1/2 cups" into
// "1 1/2cups".
@Component({
  standalone: false,
  template: `<strong><app-ingredient-amount [amount]="amount" [scale]="scale"></app-ingredient-amount>
    @if (showUnit) {
      &ngsp;<span>cups</span>
    }</strong>`
})
class AmountHostComponent {
  amount: number | string | null | undefined = 1.5;
  scale = 1;
  showUnit = true;
}

// The step ingredients, which run the amount, the unit and the name together on
// one line. The unit sits inside an interpolation here rather than its own
// element, so the spacing survives on different terms to the list above and is
// worth its own check.
@Component({
  standalone: false,
  template: `<li><app-ingredient-amount [amount]="amount" [scale]="1"></app-ingredient-amount>@if (showUnit) {
    {{ unit }}
  } {{ name }}</li>`
})
class StepAmountHostComponent {
  amount: number | string | null | undefined = 1.5;
  showUnit = true;
  unit = 'cups';
  name = 'flour';
}

describe('IngredientAmountComponent', () => {

  let fixture: ComponentFixture<AmountHostComponent>;
  let host: AmountHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngredientAmountComponent, AmountHostComponent, StepAmountHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AmountHostComponent);
    host = fixture.componentInstance;
  });

  function renderStep(amount: number, showUnit = true): string {
    const stepFixture = TestBed.createComponent(StepAmountHostComponent);
    stepFixture.componentInstance.amount = amount;
    stepFixture.componentInstance.showUnit = showUnit;
    stepFixture.detectChanges();
    return (stepFixture.nativeElement as HTMLElement).textContent.replace(/\s+/g, ' ').trim();
  }

  describe('the step ingredient line', () => {
    it('spaces the amount, the unit and the name apart', () => {
      expect(renderStep(1.5)).toBe('11⁄2 cups flour');
    });

    it('spaces the amount and the name apart with no unit', () => {
      expect(renderStep(2, false)).toBe('2 flour');
    });
  });

  function render(amount: number | string | null | undefined, scale = 1): HTMLElement {
    host.amount = amount;
    host.scale = scale;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  describe('the amount and its unit', () => {
    // The whole number and the fraction sit together in the text — what holds
    // them apart on screen is the margin, not a space character. The space that
    // has to be real is the one before the unit.
    it('keeps a space between the fraction and the unit', () => {
      const text = render(1.5).textContent.replace(/\s+/g, ' ').trim();
      expect(text).toBe('11⁄2 cups');
      expect(text).not.toContain('2cups');
    });

    it('keeps a space for a whole number too', () => {
      expect(render(2).textContent.replace(/\s+/g, ' ').trim()).toBe('2 cups');
    });

    // The accessible name is an attribute, so an ingredient copied off the page
    // carries one form of the amount rather than the label and the digits both.
    it('puts the amount on the clipboard once', () => {
      expect(render(1.5).textContent).not.toContain('1 1/2');
    });
  });

  describe('the stacked fraction', () => {
    it('sets the numerator raised and the denominator lowered', () => {
      const el = render(1.5);
      expect(el.querySelector('.amount__fraction sup').textContent).toBe('1');
      expect(el.querySelector('.amount__fraction sub').textContent).toBe('2');
    });

    it('spaces the fraction off a whole number', () => {
      const fraction = render(1.5).querySelector('.amount__fraction');
      expect(fraction.classList).toContain('amount__fraction--after-whole');
    });

    it('does not add that gap when there is no whole number', () => {
      const el = render(0.67);
      expect(el.querySelector('.amount__whole')).toBeNull();
      expect(el.querySelector('.amount__fraction').classList)
        .not.toContain('amount__fraction--after-whole');
    });

    it('sets no fraction for a whole number', () => {
      expect(render(3).querySelector('.amount__fraction')).toBeNull();
    });

    it('uses the fraction slash rather than a plain solidus', () => {
      // U+2044, which Poppins does carry — unlike the ready-made fraction
      // characters for thirds, sixths and eighths.
      expect(render(1.5).querySelector('.amount__slash').textContent).toBe('⁄');
    });
  });

  describe('what a screen reader is given', () => {
    function host(el: HTMLElement){ return el.querySelector('app-ingredient-amount'); }

    it('announces the whole amount as one label', () => {
      const amount = host(render(1.5));
      expect(amount.getAttribute('role')).toBe('img');
      expect(amount.getAttribute('aria-label')).toBe('1 1/2');
    });

    it('announces a doubled amount as what is shown', () => {
      expect(host(render(0.67, 2)).getAttribute('aria-label')).toBe('1 1/3');
    });

    it('labels a whole number too', () => {
      expect(host(render(3)).getAttribute('aria-label')).toBe('3');
    });
  });

  describe('a missing amount', () => {
    it('renders nothing at all', () => {
      const el = render(null);
      expect(el.querySelector('.amount__fraction')).toBeNull();
      expect(el.querySelector('.amount__whole')).toBeNull();
    });

    // Nothing to name, so no empty label announcing an image that is not there.
    it('drops the image role as well', () => {
      const amount = render(null).querySelector('app-ingredient-amount');
      expect(amount.getAttribute('role')).toBeNull();
      expect(amount.getAttribute('aria-label')).toBeNull();
    });
  });

  describe('reacting to the doubling toggle', () => {
    it('re-reads the amount when the flag changes', () => {
      expect(render(0.75).querySelector('.amount__fraction sub').textContent).toBe('4');
      const doubled = render(0.75, 2);
      expect(doubled.querySelector('.amount__whole').textContent).toBe('1');
      expect(doubled.querySelector('.amount__fraction sub').textContent).toBe('2');
    });
  });

});
