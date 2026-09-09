import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

  title = 'family-cook-book';

  // Key for the once-per-session flag. sessionStorage rather than
  // localStorage: the splash should return on a fresh visit, just not on every
  // route change within one.
  private static readonly INTRO_SEEN_KEY = 'gogos-intro-seen';

  showIntro: boolean = this.shouldShowIntro();

  private shouldShowIntro(): boolean {
    // Anyone who has asked for reduced motion skips a purely decorative
    // animation that holds the page back.
    const prefersReducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReducedMotion){
      return false;
    }

    // Private browsing and blocked storage both throw on access, and a splash
    // screen is never worth failing the app over.
    try {
      return sessionStorage.getItem(AppComponent.INTRO_SEEN_KEY) === null;
    } catch {
      return false;
    }
  }

  onIntroFinished(){
    this.showIntro = false;
    try {
      sessionStorage.setItem(AppComponent.INTRO_SEEN_KEY, 'true');
    } catch {
      // Storage unavailable; the splash simply shows again next navigation.
    }
  }

}
