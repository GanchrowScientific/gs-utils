/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import {getLogger} from '../gsLogger';

let logger = getLogger('classifier');

export const S_CLASSIFY = Symbol('classify');

const EMPTY_VALUE = '<MISSING>';

export function classify(...keys: string[]) {
  return function <TFunction extends Function>(ctor: TFunction): void {
    Object.defineProperty(ctor.prototype, S_CLASSIFY, {
      get: function() {
        return keys.map(function(key) {
          if (this[key] === null || typeof this[key] === 'undefined') {
            logger.error(new Error(`Cannot create classifier for key: ${key} in object: ${JSON.stringify(this)}`));
            return EMPTY_VALUE;
          }
          let val = this[key];
          return typeof val === 'function' ? val() : val.toString();
        }, this).join(':');
      }
    });
  };
}
