/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';


const DEFAULT_RETRIES = 10;
const DEFAULT_INTERVAL = 100;
const DEFAULT_TRUNCATE = Infinity;

interface BackoffOpts {
  retries?: number;
  baseInterval?: number;
  truncate?: number;
}

enum BackoffState {
  STOPPED = 0,
  FIRING
}

export class Backoff {
  private registeredCBs = [];
  private registeredEnds = [];
  private timeout: any;
  private retryCount = 0;
  private retries: number;
  private baseInterval: number;
  private truncate: number;
  private state = BackoffState.STOPPED;

  constructor(backoffOpts = {}) {
    this.retries = (<BackoffOpts>backoffOpts).retries || DEFAULT_RETRIES;
    this.baseInterval = (<BackoffOpts>backoffOpts).baseInterval || DEFAULT_INTERVAL;
    this.truncate = (<BackoffOpts>backoffOpts).truncate || DEFAULT_TRUNCATE;
  }

  public register(cb: (...args: any[]) => void) {
    this.registeredCBs.push(cb);
  }

  public onEnd(cb: () => void) {
    this.registeredEnds.push(cb);
  }

  public fire(...args: any[]) {
    if (this.retryCount >= this.retries) {
      this.reset();
      process.nextTick(() => {
        this.registeredEnds.forEach(cb => cb());
      });
    } else if (this.state === BackoffState.STOPPED) {
      this.state = BackoffState.FIRING;
      this.timeout = setTimeout(() => {
        this.state = BackoffState.STOPPED;
        this.registeredCBs.forEach(cb => cb(...args));
      }, this.calculateTime());
      this.retryCount++;
    }
  }

  public reset() {
    this.retryCount = 0;
    this.state = BackoffState.STOPPED;
    clearTimeout(this.timeout);
  }

  private calculateTime(): number {
    return Math.min(this.truncate, this.baseInterval * Math.exp(this.retryCount * this.baseInterval / 1000));
  }
}
