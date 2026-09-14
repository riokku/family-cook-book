import { Injectable, OnDestroy } from '@angular/core';

// Not in TypeScript's DOM lib at the version this project builds against, so
// the shape we use is declared here rather than reaching for `any`.
interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

/**
 * Holds the screen awake while someone is cooking.
 *
 * A recipe is read in bursts a few minutes apart — chop, read, stir, read —
 * and a phone's screen timeout is shorter than the gaps. Waking it with wet or
 * floury hands is the single most irritating thing about cooking from a phone.
 *
 * The lock is dropped by the browser whenever the tab is hidden, which is both
 * unavoidable and correct, so it is re-taken on the way back to a visible tab.
 * Support is patchy (no Firefox, no iOS before 16.4), so everything here is
 * best-effort and `isSupported` lets the UI leave the control out entirely
 * rather than offer a button that does nothing.
 */
@Injectable({ providedIn: 'root' })
export class WakeLockService implements OnDestroy {

  private sentinel: WakeLockSentinelLike | null = null;
  private wanted = false;

  private readonly onVisibilityChange = () => {
    if(this.wanted && document.visibilityState === 'visible'){
      this.acquire();
    }
  };

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  /** Whether a lock is currently held, as opposed to merely asked for. */
  get isHeld(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
  }

  async enable(): Promise<boolean> {
    if(!this.isSupported){
      return false;
    }
    this.wanted = true;
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    return this.acquire();
  }

  async disable(): Promise<void> {
    this.wanted = false;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    await this.releaseSentinel();
  }

  private async acquire(): Promise<boolean> {
    if(this.isHeld){
      return true;
    }
    try{
      // The request is rejected outright on a hidden tab, and by some browsers
      // when the battery is low — neither is an error worth surfacing.
      this.sentinel = await (navigator as any).wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => { this.sentinel = null; });
      return true;
    }catch{
      this.sentinel = null;
      return false;
    }
  }

  private async releaseSentinel(): Promise<void> {
    if(!this.sentinel){
      return;
    }
    try{
      await this.sentinel.release();
    }catch{
      // Already gone.
    }
    this.sentinel = null;
  }

  ngOnDestroy(): void {
    this.disable();
  }

}
