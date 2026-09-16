import { Subject } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { Event as RouterEvent, NavigationEnd, Router, Scroll } from '@angular/router';

import { RouteScrollService } from './route-scroll.service';

describe('RouteScrollService', () => {

  let events: Subject<RouterEvent>;
  let scroller: jasmine.SpyObj<ViewportScroller>;
  let service: RouteScrollService;

  // A navigation the router has finished, wrapped in the Scroll event it emits
  // afterwards. `position` is set only when the browser is going back or
  // forward to somewhere it has a remembered scroll offset for.
  function arriveAt(url: string, position: [number, number] | null = null): void {
    const id = 1;
    events.next(new Scroll(new NavigationEnd(id, url, url), position, null));
  }

  beforeEach(() => {
    events = new Subject<RouterEvent>();
    scroller = jasmine.createSpyObj<ViewportScroller>('ViewportScroller', [
      'scrollToPosition', 'scrollToAnchor', 'setHistoryScrollRestoration', 'getScrollPosition'
    ]);
    service = new RouteScrollService({ events: events.asObservable() } as Router, scroller);
    service.init();
  });

  describe('going somewhere new', () => {
    it('scrolls to the top of the page', () => {
      arriveAt('/recipes/lemon-cake');
      expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });

    it('scrolls to the top again on the next recipe', () => {
      arriveAt('/recipes/lemon-cake');
      scroller.scrollToPosition.calls.reset();

      arriveAt('/recipes/banana-bread');
      expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('a query parameter changing under the reader', () => {
    // The whole point: picking a serving size rewrites the URL, and the reader
    // is still looking at the ingredients half way down the page.
    it('leaves the page where it is', () => {
      arriveAt('/recipes/lemon-cake');
      scroller.scrollToPosition.calls.reset();

      arriveAt('/recipes/lemon-cake?scale=2');
      expect(scroller.scrollToPosition).not.toHaveBeenCalled();
    });

    it('stays put through a filter being typed on the recipes page', () => {
      arriveAt('/recipes');
      scroller.scrollToPosition.calls.reset();

      arriveAt('/recipes?search=c');
      arriveAt('/recipes?search=ca');
      arriveAt('/recipes?search=cak');
      expect(scroller.scrollToPosition).not.toHaveBeenCalled();
    });

    it('scrolls to the top when the path changes as well', () => {
      arriveAt('/recipes?search=cake');
      scroller.scrollToPosition.calls.reset();

      arriveAt('/recipes/lemon-cake?scale=2');
      expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('going back', () => {
    it('returns the reader to where they were on the page', () => {
      arriveAt('/recipes');
      scroller.scrollToPosition.calls.reset();

      arriveAt('/recipes', [0, 640]);
      expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 640]);
    });
  });

  describe('setting up', () => {
    it('takes scroll restoration off the browser, so nothing fights it', () => {
      expect(scroller.setHistoryScrollRestoration).toHaveBeenCalledWith('manual');
    });

    it('ignores a second call rather than listening twice', () => {
      service.init();
      arriveAt('/recipes/lemon-cake');
      expect(scroller.scrollToPosition).toHaveBeenCalledTimes(1);
    });
  });
});
