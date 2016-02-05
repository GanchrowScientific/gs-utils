/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function include(...baseCtors: Array<Function>) {
  return function <T extends Function>(target: T) { // typescript handbook
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        target.prototype[name] = baseCtor.prototype[name];
      });
    });
  };
}
