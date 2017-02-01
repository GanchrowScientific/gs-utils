/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {dup, isObject, toArray} from './utilities';

const INHERITS = 'inherits';

function inheritProperty(to: Object, from: Object, inherit: string, concatArray: boolean): void {
  if (Array.isArray(from[inherit])) {
    if (concatArray) {
      to[inherit] = to[inherit].concat(from[inherit]);
    } else {
      to[inherit] = from[inherit];
    }
  } else if (isObject(from[inherit])) {
    to[inherit] = Object.assign({}, dup(from[inherit]), to[inherit]);
  } else if (!(inherit in to)) {
    to[inherit] = from[inherit];
  }
}

export function selfExtender(config: Object, noInheritKeys?: string[], concatArray = true, innerProperty = null): Object {
  noInheritKeys = (noInheritKeys || []).concat(INHERITS);
  Object.keys(config || {}).forEach(to => {
    if (config[to][INHERITS]) {
      toArray(config[to][INHERITS]).forEach(from => {
        let toInnerConfig = config[to];
        let fromInnerConfig = config[from] || {};
        if (innerProperty) {
          fromInnerConfig = fromInnerConfig[innerProperty] || {};
          toInnerConfig = toInnerConfig[innerProperty] || (toInnerConfig[innerProperty] = {});
        }
        Object.keys(fromInnerConfig).filter(f => !noInheritKeys.includes(f)).forEach(inherit => {
          inheritProperty(toInnerConfig, fromInnerConfig, inherit, concatArray);
        });
      });
    }
  });
  return config;
}
