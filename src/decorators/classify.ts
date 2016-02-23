/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

export const S_CLASSIFY = Symbol('classify');

export function classify(...keys: string[]) {
  return function <TFunction extends Function>(ctor: TFunction): void {
    Object.defineProperty(ctor.prototype, S_CLASSIFY, {
      get: function() {
        return keys.map(function(key) {
          return typeof this[key] === 'function' ? this[key]() :
            this[key].toString();
        }, this).join(':');
      }
    });
  };
}
