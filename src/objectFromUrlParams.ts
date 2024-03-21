/* Copyright © 2024 Ganchrow Scientific, SA all rights reserved */
'use strict';

import { URLSearchParams } from 'url';

export function objectFromUrlParams(link: string): Object {
  let splitLink = link.split('?');
  let params = new URLSearchParams(
    splitLink[1] || splitLink[1] === '' ? splitLink[1] : splitLink[0]
  );
  let result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
