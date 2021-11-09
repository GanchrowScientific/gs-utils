/* Copyright © 2017-2021 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as path from 'path';
import * as fs from 'fs';
import { Type, Schema, DEFAULT_SAFE_SCHEMA } from 'js-yaml';

import { RangeExclusive, RangeInclusive } from './range';
import { isObject, shuffleArray, flattenArray as flatten } from './utilities';

class RandomElement extends Type {
  constructor() {
    super('!randomElement', {
      kind: 'sequence',
      construct(array: any[]) {
        return shuffleArray(array)[0];
      },
      resolve(array: any[]) {
        return Array.isArray(array);
      }
    });
  }
}

/**
 * A custom yaml type that concatenates strings
 * @type {Concat}
 */
class Concat extends Type {
  constructor() {
    super('!concat', {
      kind: 'sequence',
      construct(items) {
        return items.join('');
      },
      resolve(items) {
        return Array.isArray(items);
      }
    });
  }
}

/**
 * A custom yaml type that loads an environment variable
 * @type {LoadfromEnv}
 */
 class LoadFromEnv extends Type {
  constructor() {
    super('!loadFromEnv', {
      kind: 'sequence',
      construct(items) {
        const [varName, fallback] = items;
        if (process.env[varName] === undefined && fallback === undefined) {
          throw Error(`${varName} does not exist and no fallback has been specified`);
        }
        return process.env[varName] ?? fallback;
      },
      resolve(items) {
        return Array.isArray(items);
      }
    });
  }
}


/**
 * A custom yaml type that populates yaml field with items from relative file
 * @type {FromFile}
 */
class FromFile extends Type {
  constructor(basePath: string) {
    super('!fromFile', {
      kind: 'sequence',
      construct(fileAndDefault) {
        let file = fileAndDefault[0];
        try {
          return fs.readFileSync(/^\//.test(file) ? file : basePath + path.sep + file).toString('utf8').trim().split('\n');
        } catch (e) {
          return fileAndDefault[1];
        }
      },
      resolve(fileAndDefault) {
        return fileAndDefault.length === 2;
      }
    });
  }
}

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

/**
 * A custom yaml type that expands an object into an array of length { expand: number }
 */
class Expand extends Type {
  constructor() {
    super('!expand', {
      kind: 'mapping',
      construct(data: { expand: number; content: Object }) {
        return (new Array(data.expand)).fill(0).map((_, i) => {
          return JSON.parse(JSON.stringify(data.content).replace(/%%%/g, `${i}`));
        });
      },
      resolve(data) {
        return isObject(data) && isObject(data.content) && data.expand > 0;
      }
    });
  }
}

abstract class Ymd<T> extends Type {
  private static PATTERN = /(last|next) ([0-9]+) day[s]?$/i;
  private static ONE_DAY = 1000 * 60 * 60 * 24;

  constructor(key = '!ymd') {
    super(key, {
      kind: 'scalar',
      construct(data) {
        let match = data.match(Ymd.PATTERN) || [];
        let step = match[1] === 'last' ? -1 : 1;
        let day = match[2] || 0;
        let newDate = new Date(Date.now() + step * Ymd.ONE_DAY * day);
        return this.dateFormat(newDate);
      }
    });
  }

  protected abstract dateFormat(date: Date): T;
}

class YmdTimestamp extends Ymd<number> {

  constructor() {
    super('!ymd_timestamp');
  }

  /* tslint:disable no-bitwise */
  protected dateFormat(date: Date): number {
    return (+date / 1000) | 0;
  }
  /* tslint:enable no-bitwise */
}

class YmdString extends Ymd<string> {
  protected dateFormat(date: Date): string {
    return `${date.toISOString().split('T')[0].replace(/\-/g, '')}`;
  }
}

export function schemaFactory(basePath: string) {
  // See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18978
  return (Schema as any).create(DEFAULT_SAFE_SCHEMA, [
    new Range(), new Path(basePath), new Flatten(), new YmdString(), new FromFile(basePath),
    new RandomElement(), new YmdTimestamp(), new Concat(), new Expand(), new LoadFromEnv()
  ]);
}
