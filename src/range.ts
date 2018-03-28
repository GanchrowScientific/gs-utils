/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

function getRangeArguments(items: string[], splitter = '..'): number[] {
  let [rawRange, step] = items;
  return [...rawRange.split(splitter).map(Number), Number(step)];
}

export abstract class Range extends Array {
  constructor(rawRange: string, private splitter = '..') {
    super();
    let [start, end, step] = getRangeArguments(rawRange.split(','), this.splitter);
    this.generateRange(start, end, step);
  }

  protected abstract generateRange(start: number, end: number, step?: number);
}

export class RangeExclusive extends Range {
  constructor(rawRange: string) {
    super(rawRange, '...');
  }

  protected generateRange(start: number, end: number, step?: number) {
    step = Number(step);
    if (start < end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start + step; i < end; i = i + step) {
        this.push(i);
      }
      return;
    }
    if (start > end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start - step; i > end; i = i - step) {
        this.push(i);
      }
      return;
    }
    this.push(start);
  }
}

export class RangeInclusive extends Range {
  protected generateRange(start: number, end: number, step?: number) {
    step = Number(step);
    if (start < end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start; i <= end; i = i + step) {
        this.push(i);
      }
      return;
    }
    if (start > end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start; i >= end; i = i - step) {
        this.push(i);
      }
      return;
    }
    this.push(start);
  }
}
