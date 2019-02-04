/* Copyright © 2015-2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

export class GSThrottle {
  private timeoutId: NodeJS.Timer;
  private cycleEndTime = 0;
  private registeredCallback: (...args) => void;
  private hardDelay: number;
  private softDelay: number;

  constructor(hardDelay: number, softDelay?: number) {
    this.hardDelay = Math.floor(hardDelay) || Infinity;
    this.softDelay = Math.min(Math.floor(softDelay) || this.hardDelay, this.hardDelay);
    if (this.softDelay <= 0 || !Number.isFinite(this.softDelay)) {
      throw new RangeError( 'throttle: invalid delay time');
    }
  }

  public callback(cb: (...args: any[]) => void) {
    this.wrap(cb);
  }

  public more(...args: any[]) {
    this.registeredCallback(...args);
  }

  private wrap(cb: (...args: any[]) => void) {
    this.registeredCallback = (...args: any[]) => {
      let fn = () => {
        this.cycleEndTime = 0;
        cb(...args);
      };
      let delay;
      clearTimeout(this.timeoutId);
      if (this.cycleEndTime) {
        delay = Math.min(this.softDelay, this.cycleEndTime - Date.now());
      } else {
        this.cycleEndTime = Date.now() + this.hardDelay;
        delay = this.softDelay;
      }

      if (delay > 0) {
        this.timeoutId = setTimeout( fn, delay );
      } else {
        fn();
      }
    };
  }
}
