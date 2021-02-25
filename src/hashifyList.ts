/* Copyright © 2021 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function hashifyList(list: string, delim = ','): Object {
  return list.split(delim).reduce((r, k) => {
    if (r[1]) {
      r[0][r[1]] = k;
      r[1] = null;
    } else {
      r[1] = k;
    }
    return r;
  }, [{}, null] as any)[0];
}
