import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

  title = 'family-cook-book';

  private static readonly INTRO_SEEN_KEY = 'gogos-intro-seen';

  // Show the splash at most once in this window. sessionStorage looks like the
  // natural fit, but it is scoped per tab rather than per browsing session, so
  // opening a recipe in a second tab replayed the whole animation. A timestamp
  // in localStorage gives "not again today, but yes on a fresh visit".
  private static readonly INTRO_INTERVAL_MS = 12 * 60 * 60 * 1000;

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
      const lastSeen = Number(localStorage.getItem(AppComponent.INTRO_SEEN_KEY));
      // Covers null (0) and anything unparseable (NaN): both mean "show it".
      return !lastSeen || Date.now() - lastSeen > AppComponent.INTRO_INTERVAL_MS;
    } catch {
      return false;
    }
  }

  onIntroFinished(){
    this.showIntro = false;
    try {
      localStorage.setItem(AppComponent.INTRO_SEEN_KEY, String(Date.now()));
    } catch {
      // Storage unavailable; the splash simply shows again next navigation.
    }
  }

}
