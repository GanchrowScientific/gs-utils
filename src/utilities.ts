/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

export type Bing = string | Buffer;

export type ParsedJson = any;

export const isJSON = Object.defineProperties(function (str: Bing): boolean {

  if (typeof str === 'string') {

    return (isJSON.BEGIN_OBJECT_JSON.test(str) && isJSON.END_OBJECT_JSON.test(str)) ||
      (isJSON.BEGIN_ARRAY_JSON.test(str) && isJSON.END_ARRAY_JSON.test(str))
      ;

  } else if (typeof str === 'buffer') {

    return (str[0] === isJSON.BUFFER_BEGIN_OBJECT_JSON && str[str.length - 1] === isJSON.BUFFER_END_OBJECT_JSON) ||
      (str[0] === isJSON.BUFFER_BEGIN_ARRAY_JSON && str[str.length - 1] === isJSON.BUFFER_END_ARRAY_JSON)
      ;

  }

  throw new TypeError('Argument is neither string nor Buffer');
},
  {
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

  } else if (typeof str === 'buffer') {

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

export function isObject(obj: any): boolean {
  return obj != null && typeof obj === 'object';
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

export function dup<T>(obj: T, ignoreKeys?: string[]): ParsedJson {
  let cb = null;
  if (ignoreKeys) {
    cb = (k, v) => {
      if (ignoreKeys.includes(k)) {
        return undefined;
      }
      return v;
    };
  }
  return JSON.parse(JSON.stringify(obj, cb));
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

export const TYPEOF_UNDEFINED = 'undefined';
export const TYPEOF_NUMBER = 'number';
export const TYPEOF_STRING = 'string';
export const TYPEOF_OBJECT = 'object';
export const TYPEOF_FUNCTION = 'function';
