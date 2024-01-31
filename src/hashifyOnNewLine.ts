/* Copyright © 2024 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function hashifyOnNewLine(list: string, length = 3, mapper?: (a: any, b: number, ...args: any[]) => any): Object {
  return list.split('\n').reduce((r, k) => {
    let items = k.split(',');
    if (items.length === length && length > 1) {
      items = mapper ? items.map((m, i) => mapper(m, i)) : items;
      let obj;
      for (let i = 0; i < length; i++) {
        if (i < length - 1) {
          if (!obj) {
            r[items[i]] = r[items[i]] || {};
            obj = r;
          } else {
            obj[items[i]] = obj[items[i]] || {};
          }
          if (i < length - 2) {
            obj = obj[items[i]];
          }
        } else {
          obj[items[i - 1]] = items[i];
        }
      }
    }
    return r;
  }, {});
}
