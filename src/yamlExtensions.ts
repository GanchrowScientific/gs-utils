/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as path from 'path';
import {Type, Schema, DEFAULT_SAFE_SCHEMA} from 'js-yaml';

class Range extends Type {
  constructor() {
    super('!range', {
      kind: 'sequence',
      construct: (data) => {
        return Array.isArray(data) && data.length === 1 ? this.transform(data[0]) : [];
      }
    });
  }

  protected transform(v: string): any {
    v = String(v);
    if (/^-*[0-9.]+\.\.\.-*[0-9.]+/.test(v)) {
      let [start, end, step] = this.getRangeArguments(v.split(','), '...');
      return this.rangeExclusive(start, end, step);
    }
    if (/^-*[.0-9]+\.\.-*[0-9.]+/.test(v)) {
      let [start, end, step] = this.getRangeArguments(v.split(','), '..');
      return this.rangeInclusive(start, end, step);
    }
    return [];
  }

  private rangeInclusive(start: number, end: number, step?: number): number[] {
    let array = [];
    step = Number(step);
    if (start < end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start; i <= end; i = i + step) {
        array.push(i);
      }
      return array;
    }
    if (start > end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start; i >= end; i = i - step) {
        array.push(i);
      }
      return array;
    }
    return [start];
  }

  private rangeExclusive(start: number, end: number, step?: number): number[] {
    let array = [];
    step = Number(step);
    if (start < end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start + step; i < end; i = i + step) {
        array.push(i);
      }
      return array;
    }
    if (start > end && Math.abs(step || 1) > 0) {
      step = Math.abs(step || 1);
      for (let i = start - step; i > end; i = i - step) {
        array.push(i);
      }
      return array;
    }
    return [start];
  }

  private getRangeArguments(items: string[], splitter = '..'): number[] {
    let [rawRange, step] = items;
    return [...rawRange.split(splitter).map(Number), Number(step)];
  }
}

/**
 * A custom yaml type that describes a path relative to the file being loaded
 * @type {Path}
 */
class Path extends Type {
  constructor(basePath: string) {
    super('!path', {
      kind: 'scalar',
      construct(data) {
        return basePath + path.sep + data;
      },

      resolve(data) {
        return typeof data === 'string';
      }
    });
  }
}

export function schemaFactory(basePath: string) {
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18978
  return (Schema as any).create(DEFAULT_SAFE_SCHEMA, [ new Range(), new Path(basePath) ]);
}
