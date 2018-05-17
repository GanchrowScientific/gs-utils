/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {dup, isObject, toArray} from './utilities';

const INHERITS = 'inherits';

function inheritProperty(to: Object, from: Object, inherit: string): void {
  if (Array.isArray(from[inherit])) {
    to[inherit] = to[inherit] || dup(from[inherit]);
  } else if (isObject(from[inherit])) {
    to[inherit] = Object.assign({}, dup(from[inherit]), to[inherit]);
  } else if (!(inherit in to)) {
    to[inherit] = from[inherit];
  }
}

export function selfExtender(config: Object, noInheritKeys?: string[], innerProperty = null): Object {
  noInheritKeys = (noInheritKeys || []).concat(INHERITS);
  sortFromRoot(config).forEach(to => {
    if (config[to][INHERITS]) {
      toArray(config[to][INHERITS]).forEach(from => {
        let toInnerConfig = config[to];
        let fromInnerConfig = config[from] || {};
        if (innerProperty) {
          fromInnerConfig = fromInnerConfig[innerProperty] || {};
          toInnerConfig = toInnerConfig[innerProperty] || (toInnerConfig[innerProperty] = {});
        }

        Object.keys(fromInnerConfig).filter(f => !noInheritKeys.includes(f)).forEach(inherit => {
          inheritProperty(toInnerConfig, fromInnerConfig, inherit);
        });
      });
    }
  });
  return config;
}

function sortFromRoot(config: Object): string[] {
  let sorted = [];
  let seen = new Set();
  Object.keys(config || {}).forEach(walkToRoot);

  function walkToRoot(key) {
    if (seen.has(key) || !(key in config)) {
      return;
    }

    seen.add(key);
    if ((INHERITS in config[key])) {
      toArray(config[key][INHERITS]).forEach(walkToRoot);
    }
    sorted.push(key);
  }
  return sorted;
}

