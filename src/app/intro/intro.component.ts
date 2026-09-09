import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';

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

  // The wrapper's fade-out is scheduled at 2.1s and runs for 0.9s.
  private static readonly DURATION_MS = 3000;
  private timeout: ReturnType<typeof setTimeout>;

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
