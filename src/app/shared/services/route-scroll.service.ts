import { Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

/**
 * Scrolling between pages, minus the jump to the top that a query parameter
 * used to cause.
 *
 * The router's own scrollPositionRestoration treats every navigation alike, and
 * writing state into the URL is a navigation: choosing to make double the
 * recipe, or typing a letter into the search box, threw the reader back to the
 * top of the page they were already reading. Those are not journeys anywhere,
 * so here only a change of *path* counts as arriving somewhere new.
 *
 * The router still emits its Scroll events with scrollPositionRestoration set
 * to 'disabled' — that setting governs only whether the router acts on them —
 * which is what leaves this free to act on them instead.
 */
@Injectable({ providedIn: 'root' })
export class RouteScrollService {

  private lastPath: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ){}

  init(): void {
    // Calling init twice would leave two subscriptions fighting over the same
    // scroll position.
    if(this.subscription){
      return;
    }

    // Taken off the browser, which would otherwise restore a position of its
    // own on top of the one restored below. The router does exactly this when
    // its own restoration is on.
    this.viewportScroller.setHistoryScrollRestoration('manual');

    this.subscription = this.router.events
      .pipe(filter((event): event is Scroll => event instanceof Scroll))
      .subscribe(event => this.onScroll(event));
  }

  private onScroll(event: Scroll): void {
    const path = this.pathOf(event);
    const arrivedSomewhereNew = path !== this.lastPath;
    this.lastPath = path;

    // Back or forward: the reader has been here before and the router knows
    // where they were on the page.
    if(event.position){
      this.viewportScroller.scrollToPosition(event.position);
      return;
    }

    if(arrivedSomewhereNew){
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    // Otherwise: same path, no stored position — a query parameter changed
    // under a reader who has not gone anywhere. Leave the page where it is.
  }

  /**
   * The part of the URL that means "a different page". Everything after it is
   * state about the page rather than which page it is.
   */
  private pathOf(event: Scroll): string {
    const routerEvent = event.routerEvent;
    const url = routerEvent instanceof NavigationEnd
      ? routerEvent.urlAfterRedirects
      : routerEvent.url;
    return url.split('?')[0].split('#')[0];
  }
}
