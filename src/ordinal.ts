/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function ordinal(n) {
  let s = Number(n);
  if (s > 0) {
    if (Math.floor(s % 100 / 10) === 1) {
      return `${s}th`;
    }
    switch (s % 10) {
    case 1:
      return `${s}st`;
    case 2:
      return `${s}nd`;
    case 3:
      return `${s}rd`;
    default:
      return `${s}th`;
    }
  }
  return n;
}
