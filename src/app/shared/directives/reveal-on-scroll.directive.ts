import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';

// Fades and lifts an element in as it scrolls into view.
//
// The hidden state is applied by script rather than by CSS, so if this never
// runs — no IntersectionObserver, or the visitor prefers reduced motion — the
// content simply stays visible instead of being stranded at opacity 0.
@Directive({
    selector: '[appRevealOnScroll]',
    standalone: false
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {

  // Stagger, in milliseconds, so a row of cards arrives in sequence.
  @Input('appRevealOnScroll') revealDelay: number | string = 0;

  private observer: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(prefersReducedMotion || typeof IntersectionObserver === 'undefined'){
      return;
    }

    const host = this.el.nativeElement;
    this.renderer.addClass(host, 'reveal-pending');
    this.renderer.setStyle(host, 'transition-delay', `${Number(this.revealDelay) || 0}ms`);

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          this.renderer.addClass(host, 'reveal-visible');
          // One-shot: re-animating on every scroll past is a distraction.
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
