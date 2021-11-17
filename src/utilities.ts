/* Copyright © 2018-2021 Ganchrow Scientific, SA all rights reserved */

'use strict';

export const TYPEOF_UNDEFINED = 'undefined';
export const TYPEOF_NUMBER = 'number';
export const TYPEOF_STRING = 'string';
export const TYPEOF_OBJECT = 'object';
export const TYPEOF_FUNCTION = 'function';
export const NOOP = () => { /**/ };

export type Bing = string | Buffer;

export type ParsedJson = any;

export const isJSON = Object.defineProperties(function (str: Bing): boolean {

  if (typeof str === 'string') {
    return (str === 'false') || (str === 'true') ||
      (isJSON.BEGIN_OBJECT_JSON.test(str) && isJSON.END_OBJECT_JSON.test(str)) ||
      (isJSON.BEGIN_ARRAY_JSON.test(str) && isJSON.END_ARRAY_JSON.test(str))
    ;

  } else if (str instanceof Buffer) {

    return isJSON.isFalseBuffer(str) || isJSON.isTrueBuffer(str) ||
      (str[0] === isJSON.BUFFER_BEGIN_OBJECT_JSON && str[str.length - 1] === isJSON.BUFFER_END_OBJECT_JSON) ||
      (str[0] === isJSON.BUFFER_BEGIN_ARRAY_JSON && str[str.length - 1] === isJSON.BUFFER_END_ARRAY_JSON)
    ;

  }

  throw new TypeError('Argument is neither string nor Buffer');
},
  {
    FALSE_BUFFER: { value: Buffer.from('false') },
    TRUE_BUFFER: { value: Buffer.from('true') },
    isFalseBuffer: { value: (buf: Buffer) => isJSON.FALSE_BUFFER.every((b, i) => b === buf[i]) },
    isTrueBuffer: { value: (buf: Buffer) => isJSON.TRUE_BUFFER.every((b, i) => b === buf[i]) },
    BEGIN_OBJECT_JSON: { value: /^\{/ },
    END_OBJECT_JSON: { value: /\}$/ },
    BEGIN_ARRAY_JSON: { value: /^\[/ },
    END_ARRAY_JSON: { value: /\]$/ },
    BUFFER_BEGIN_OBJECT_JSON: { value: '{'.codePointAt(0) },
    BUFFER_END_OBJECT_JSON: { value: '}'.codePointAt(0) },
    BUFFER_BEGIN_ARRAY_JSON: { value: '['.codePointAt(0) },
    BUFFER_END_ARRAY_JSON: { value: ']'.codePointAt(0) }
  }
);

export const isXML = Object.defineProperties(function (str: Bing): boolean {

  if (typeof str === 'string') {

    return isXML.XML_REGEXP.test(str);

  } else if (str instanceof Buffer) {

    return (str[0] === isXML.BUFFER_BEGIN_XML) && (str[str.length - 1] === isXML.BUFFER_END_XML);

  }

  throw new TypeError('Argument is neither string nor Buffer');
},
  {
    XML_REGEXP: { value: /^<[\s\S]*>$/ },
    BUFFER_BEGIN_XML: { value: '<'.codePointAt(0) },
    BUFFER_END_XML: { value: '>'.codePointAt(0) }
  }
);

export type OptArgCbFunc = (err?: Error, res?: any) => void;
export type NoArgVoidFunc = () => void;
export type ErrorArgVoidFunc = (err: Error) => void;
export type AnyVoidFunc = (...args: any[]) => void;

export class BasicObject extends null {
  constructor() {
    return Object.create(null);
  }
}

export class SimpleStore {
  private obj = {};

  public fetch(keyOrValue: any): any {
    return this.obj[keyOrValue] || keyOrValue;
  }

  public store(currentValue: any, nextValue: any): any {
    let finalValue = currentValue;
    if (nextValue) {
      this.obj[currentValue] = nextValue;
      finalValue = nextValue;
    }
    return finalValue;
  }

  public clear(): void {
    this.obj = {};
  }
}

export function toArray<T>(obj?: T[] | T): T[] {
  return Array.isArray(obj) ? obj : obj === undefined ? [] : [obj];
}

export function isFunction(fn: any): boolean {
  return typeof fn === TYPEOF_FUNCTION;
}

export function isNumber(n: any): boolean {
  return typeof n === TYPEOF_NUMBER;
}

export function isString(s: any): boolean {
  return typeof s === TYPEOF_STRING;
}

export function isUndefined(d: any): boolean {
  return typeof d === TYPEOF_UNDEFINED;
}

export function isObject(obj: any): boolean {
  return obj != null && typeof obj === TYPEOF_OBJECT;
}

export function isStrictObject(obj: any): boolean {
  return isObject(obj) && !Array.isArray(obj);
}

export function ensureObject(obj: Object, field: string): Object {
  return isStrictObject(obj[field]) && obj[field] || (obj[field] = {});
}

export function deepEnsureObject(obj: Object, fields: (string | number)[]): Object {
  let field: string;
  let stringifiedFields: string[] = fields.map(String);
  while (field = stringifiedFields.shift()) {
    obj = ensureObject(obj, field);
  }
  return obj;
}

export function deepFreeze<T>(obj: T): T {
  if (isObject(obj) || typeof obj === 'function') {
    Object.freeze(obj);
    Object.keys(obj).forEach(key => {
      deepFreeze(obj[key]);
    });
  }
  return obj;
}

/**
 * Deeply sets a value on an object if the list of nested fields exist.
 * The nested objects will be recursivey traversed in the order specified by
 * the parameters. If none of the objects are missing, the final value will
 * be set.
 *
 * @param  {Object}     obj object to set value on
 * @param  {any}        val the value to set
 * @param  {(string |   number)[]}   ...fields  the list of fields to traverse in order to set the value
 * @return {boolean}        true if the field set exists on the object. false otherwise.
 */
export function safeSetProperty(obj: Object, val: any, ...fields: (string | number)[]): boolean {
  if (fields.length === 0) {
    throw new Error('Must specify at least one field');
  }
  if (typeof obj === 'undefined' || obj === null) {
    throw new Error('Must supply an object');
  }
  while (fields.length > 1) {
    let field = fields.shift();
    obj = obj[field];
    if (typeof obj === 'undefined') {
      return false;
    }
  }
  obj[fields.shift()] = val;
  return true;
}

export function dup<T>(obj: T, ignoreKeys: string[] = [], exceptValues = {}): ParsedJson {
  let cb = (k, v) => {
    if (ignoreKeys.includes(k)) {
      if (!(exceptValues[k] === v)) {
        return undefined;
      }
    }
    if (v === Infinity) {
      return '#∞#';
    }
    if (v === -Infinity) {
      return '#-∞#';
    }
    return v;
  };
  return JSON.parse(JSON.stringify(obj, cb), (k, v) => {
    if (v === '#∞#') {
      return Infinity;
    }
    if (v === '#-∞#') {
      return -Infinity;
    }
    return v;
  });
}

export function valuesAtCreate(...keys: any[]): (obj: Object) => Array<any> {
  return (obj) => {
    return keys.map(key => obj[key]);
  };
}

export function allArrayItemTypesMatch(array: Array<any>): boolean {
  return array.every(isSameTypeOf(array[0]));
}

export function isSameTypeOf(chkVal): (val) => boolean {
  return (val) => {
    return typeof chkVal === typeof val;
  };
}

export function isNumeric(value: any) {
  return (!!value || value === 0) && value !== true && !Array.isArray(value) &&
    !isNaN(value) && String(value).length !== 0;
}

export class CaseInsensitiveBucket {
  private obj = new Set();
  constructor(...args: string[]) {
    args.forEach(arg => {
      this.obj.add(String(arg).toLowerCase());
    });
  }

  public has(key: string): boolean {
    return this.obj.has(String(key).toLowerCase());
  }
}

export function stripAnyValues<T>(obj: T, ...args: any[]): ParsedJson {
  let dupItems = dup(obj);
  toArray(dupItems).forEach(item => {
    args.forEach(arg => {
      delete item[arg];
    });
  });
  return dupItems;
}

export function flattenArray(ary: any[]): any[] {
  return ary.reduce((b, c) => b.concat(c), []);
}

export function stringifyJSONNoEmptyArrays(obj: any): string {
  return JSON.stringify(obj, function (key: string, value: any): any {
    if (!Array.isArray(value) || value.length) {
      return value;
    }
  });
}

export function multiArraySome(arrays: any[][], match: any, index?: number): boolean {
  return arrays.some(array => {
    if (isFunction(match)) {
      return array.some(match);
    }
    return isNumber(index) ? toArray(array)[index] === match :
      toArray(array).includes(match)
    ;
  });
}

export function multiArrayEvery(arrays: any[][], match: any, index?: number): boolean {
  return arrays.every(array => {
    if (isFunction(match)) {
      return array.every(match);
    }
    return isNumber(index) ? toArray(array)[index] === match :
      toArray(array).includes(match)
    ;
  });
}

export function hasAllPropertyValues(main: Object, other: Object): boolean {
  return Object.keys(main).every(key => {
    if (isObject(main[key])) {
      if (isObject(other[key])) {
        return hasAllPropertyValues(main[key], other[key]);
      }
    } else {
      return main[key] === other[key];
    }
  });
}

/**
 * Checks that both arrays are the same size and every element in the first array exists in the second.
 * If one array is falsy, then the other array must be empty or falsy for this function to return true.
 * @param  {any[]}   first
 * @param  {any[]}   second
 * @return {boolean}        true if every element of the first array exists in the second they are the same size
 */
export function arraysEquivalent(first?: any[], second?: any[]): boolean {
  first = first || [];
  second = second || [];
  return first.length === second.length && first.every(val => second.includes(val));
}

/**
 * Checks that every element of a is present in b, but a can be a subset of b
 * @param  {any[]}   a
 * @param  {any[]}   b
 * @return {boolean} true if every element of the first array exists in the second
 */
export function arrayIsSubset(a: any[], b: any[]): boolean {
  a = a || [];
  b = b || [];
  return a.every(el => b.includes(el));
}

export function arrayPartition<T>(array: T[], partition: (item: any) => boolean): [T[], T[]] {
  return array.reduce((part, item) => (part[partition(item) ? 0 : 1].push(item), part), [[], []] as [T[], T[]]);
}

export function swapItems<T extends Array<any>>(item: T): T {
  if (Array.isArray(item)) {
    let it = item[0];
    item[0] = item[1];
    item[1] = it;
  }
  return item;
}

export function leftDigit(x: number, n = 1): number {
  if ((n < 1) || (10 ** (n - 1) > x)) {
    return 0;
  }
  return Math.floor(x / 10 ** (Math.floor(Math.log10(x) - n + 1)));
}

export function convertArrayValuesToObject(obj: {[a: string]: any[]}): {[a: string]: any}[] {
  return Object.keys(obj).reduce((arr, key) => {
    toArray(obj[key]).forEach((val, vidx) => {
      Object.assign(arr[vidx] = arr[vidx] || {}, {[key]: val});
    });
    return arr;
  }, []);
}

export function rejectKeys<O, K extends keyof O>(obj: O, ...keys: K[]): Pick<O, K> {
  return keys.reduce((o, k) => {
    let val = obj[k];
    delete obj[k];
    return (o[k] = val, o);
  }, {} as any);
}

export function pickKeys<O, K extends keyof O>(obj: O, ...keys: K[]): Pick<O, K> {
  return keys.reduce((o, k) => {
    let val = obj[k];
    return (o[k] = isObject(val) ? dup(val) : val, o);
  }, {} as any);
}

export function shuffleArray(array: any[]): any[] {
  return array.sort(_ => Math.random() < Math.random() ? -1 : 1);
}

export function leftPad (n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function lastItem<T>(items: T | T[]): T {
  items = toArray(items);
  return items[items.length - 1];
}

export function isToday(utcMilliSeconds: number): boolean {
  let todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  let tomorrowMidnight = new Date();
  tomorrowMidnight.setHours(0, 0, 0, 0);
  tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

  return todayMidnight.getTime() <= utcMilliSeconds && utcMilliSeconds < tomorrowMidnight.getTime();
}
