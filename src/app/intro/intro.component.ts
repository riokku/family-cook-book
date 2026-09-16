import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';

// One falling sprinkle. Everything that varies per sprinkle is a plain CSS
// property, so the stylesheet keeps the motion and this keeps the scatter.
interface Sprinkle {
  variant: string;
  styles: { [property: string]: string };
}

@Component({
    selector: 'app-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss'],
    standalone: false
})
export class IntroComponent implements OnInit, OnDestroy {

  // Fires when the splash is done, either because the animation finished or
  // because the visitor skipped it.
  @Output() finished = new EventEmitter<void>();

  // The wrapper's fade-out is scheduled at 2.2s and runs for 0.8s.
  private static readonly DURATION_MS = 3000;
  private timeout: ReturnType<typeof setTimeout>;

  // Enough to read as a downpour rather than a handful. They animate transform
  // and opacity only, and each one is a few pixels across, so even at this
  // count the whole shower stays cheap on the compositor.
  private static readonly SPRINKLE_COUNT = 180;

  private static readonly SPRINKLE_COLORS = [
    '#ff6b81', '#ffd32a', '#00d2d3', '#ff6348',
    '#1dd1a1', '#a29bfe', '#fd79a8', '#ffffff'
  ];

  // Four fall paths, each with its own drift and spin. Picking from a handful
  // of keyframes gives the variety that a per-sprinkle rotation would, without
  // needing a custom property on every element.
  private static readonly FALL_VARIANTS = ['fall-a', 'fall-b', 'fall-c', 'fall-d'];

  // Built once, in the field initialiser rather than ngOnInit: re-rolling the
  // randoms on a later change detection pass would restart every animation.
  readonly sprinkles: Sprinkle[] = IntroComponent.buildSprinkles();

  private static buildSprinkles(): Sprinkle[] {
    const sprinkles: Sprinkle[] = [];

    for(let i = 0; i < IntroComponent.SPRINKLE_COUNT; i++){
      sprinkles.push({
        variant: IntroComponent.pick(IntroComponent.FALL_VARIANTS),
        styles: {
          'left': `${IntroComponent.random(0, 100)}%`,
          'background-color': IntroComponent.pick(IntroComponent.SPRINKLE_COLORS),
          'height': `${IntroComponent.random(9, 16)}px`,
          // The last ones start falling at 1.35s, well before the 2.2s fade, so
          // the screen is still full of them when it goes.
          'animation-delay': `${IntroComponent.random(0.2, 1.35)}s`,
          // Varied speeds are what stop sixty identical rods reading as a grid
          // sliding down the screen.
          'animation-duration': `${IntroComponent.random(1.4, 2.4)}s`
        }
      });
    }

    return sprinkles;
  }

  private static random(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
  }

  private static pick<T>(options: T[]): T {
    return options[Math.floor(Math.random() * options.length)];
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.timeout = setTimeout(() => this.finish(), IntroComponent.DURATION_MS);
  }

  // Any key, click or tap gets past it — nobody should be held at a splash
  // screen they have already seen.
  @HostListener('document:keydown')
  @HostListener('document:click')
  @HostListener('document:touchstart')
  skip(){
    this.finish();
  }

  private finish(){
    clearTimeout(this.timeout);
    this.finished.emit();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);
    document.body.style.overflow = '';
  }
}
