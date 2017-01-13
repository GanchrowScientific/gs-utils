/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {dup, isObject, toArray} from './utilities';

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

export function selfExtender(config: Object, noInheritKeys = [], concatArray = true): Object {
  noInheritKeys = (noInheritKeys || []).concat('inherits');
  Object.keys(config || {}).forEach(to => {
    if (config[to].inherits) {
      toArray(config[to].inherits).forEach(from => {
        Object.keys(config[from]).filter(f => !noInheritKeys.includes(f)).forEach(inherit => {
          inheritProperty(config[to], config[from], inherit, concatArray);
        });
      });
    }
  });
  return config;
}
