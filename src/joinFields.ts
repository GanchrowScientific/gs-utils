/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

import { isUndefined } from './utilities';

export function joinFields(messages: Object[], batch = 10): Object[] {
  let sliced = [];
  for (let i = 0; i < Math.ceil(messages.length / batch); i++) {
    sliced.push(messages.slice(i * batch, i * batch + batch).reduce((cur, message) => {
      Object.entries(message).forEach(([k, v]) => {
        if (isUndefined(cur[k])) {
          cur[k] = v;
        } else {
          cur[k] = `${cur[k]},${v}`;
        }
      });
      return cur;
    }, {}));
  }
  return sliced;
}
