/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function partitionBatch<T>(messages: T[], batch = 100): T[][] {
  let result = [];
  for (let i = 0; i < Math.ceil(messages.length / batch); i++) {
    result.push(messages.slice(i * batch, batch * (i + 1)));
  }
  return result;
}
