/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {getLogger} from './gsLogger';

const logger = getLogger('Incrementer');

interface TrackObject {
  value: number;
  timestamp: number;
}

export class Incrementer {
  private map = new Map<string, TrackObject>();

  constructor(private trackIdleTime, private trackInterval) {
    this.beginIdleCheck();
  }

  public get(item: string): number {
    let tracker = this.map.get(item);
    if (tracker) {
      return tracker.value;
    }
    this.map.set(item, this.newValue(0));
    return 0;
  }

  public incr(item: string, value = 1): void {
    this.map.set(item, this.newValue(this.get(item) + value));
  }

  public clear(item: string): boolean {
    return this.map.delete(item);
  }

  private beginIdleCheck() {
    if (this.trackIdleTime > 0) {
      setInterval(() => {
        let t = Date.now();
        for (let [key, tracker] of this.map.entries()) {
          if ((t - tracker.timestamp) >= this.trackIdleTime) {
            logger.debug(`Clearing idle incrementer key ${key}`);
            this.clear(key);
          }
        }
      }, this.trackInterval);
    }
  }

  private newValue(n: number): TrackObject {
    return { value: n, timestamp: Date.now() };
  }
}

export const createIncrementer = (idleTime = 5000, interval = 60000): Incrementer => {
  return new Incrementer(idleTime, interval);
};
