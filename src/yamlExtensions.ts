/* Copyright © 2017-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as path from 'path';
import {Type, Schema, DEFAULT_SAFE_SCHEMA} from 'js-yaml';

import {RangeExclusive, RangeInclusive} from './range';
import {flattenArray as flatten} from './utilities';

/**
 * A custom yaml type that converts a range into an array
 * @type {Range}
 */
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
      return new RangeExclusive(v);
    }
    if (/^-*[.0-9]+\.\.-*[0-9.]+/.test(v)) {
      return new RangeInclusive(v);
    }
    return [];
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

/**
 * A custom yaml type that flattens yaml arrays, useful for merging in array configurations
 * @type {Flatten}
 */
class Flatten extends Type {
  constructor() {
    super('!flatten', {
      kind: 'sequence',
      construct(data) {
        return flatten(data);
      },
      resolve(data) {
        return Array.isArray(data);
      }
    });
  }
}

class Ymd extends Type {
  private static PATTERN = /last ([0-9]+) day[s]?$/i;
  private static ONE_DAY = 1000 * 60 * 60 * 24;

  constructor() {
    super('!ymd', {
      kind: 'scalar',
      construct(data) {
        let day = Number((data.match(Ymd.PATTERN) || [])[1]) || 0;
        let newDate = new Date(Date.now() - Ymd.ONE_DAY * day);
        return `${newDate.toISOString().split('T')[0].replace(/\-/g, '')}`;
      }
    });
  }
}

export function schemaFactory(basePath: string) {
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18978
  return (Schema as any).create(DEFAULT_SAFE_SCHEMA, [ new Range(), new Path(basePath), new Flatten(), new Ymd() ]);
}
