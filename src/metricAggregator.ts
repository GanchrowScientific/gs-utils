/* Copyright © 2025 Ganchrow Scientific, SA all rights reserved */

'use strict';

import { max, mean, min } from 'simple-statistics';

export class MetricAggregator {
  private items: number[] = [];
  private lastFlushTs: number = Date.now();

  constructor(
    private flushPeriodMs = 60000,
    private flushSize = 1000,
  ) {
    if (this.flushPeriodMs < 1) {
      throw new Error('Flush period must be greater than 0; got ' + this.flushPeriodMs);
    }
    if (this.flushSize < 1) {
      throw new Error('Flush size must be greater than 0; got ' + this.flushSize);
    }
  }

  public add(value: number, nowTs = Date.now()): any | null {
    this.items.push(value);

    if (this.items.length >= this.flushSize
      || nowTs - this.lastFlushTs >= this.flushPeriodMs) {
      return this.flush(nowTs);
    }

    return null;
  }

  public flush(nowTs: number = Date.now()): any {
    const count = this.items.length;
    const periodMs = nowTs - this.lastFlushTs;
    const from = (new Date(this.lastFlushTs)).toISOString();
    const to = (new Date(nowTs)).toISOString();
    this.lastFlushTs = nowTs;

    if (count < 1) {
      return {
        from,
        to,
        periodMs,
        count,
      };
    }

    const items = this.items;
    this.items = [];

    return {
      from,
      to,
      periodMs,
      count,
      min: min(items),
      max: max(items),
      mean: mean(items),
    };
  }
}
