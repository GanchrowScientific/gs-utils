/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { partitionBatch } from '../src/partitionBatch';

describe('partitionBatch', () => {
  it('should create array of arrays from batch number', () => {
    let a = [1, 2, 3];
    expect(partitionBatch(a, 2)).toEqual([[1, 2], [3]]);
    expect(partitionBatch(a, 3)).toEqual([[1, 2, 3]]);
    expect(partitionBatch(a, 4)).toEqual([[1, 2, 3]]);
    expect(partitionBatch(a)).toEqual([[1, 2, 3]]);
    expect(partitionBatch(a, 1)).toEqual([[1], [2], [3]]);
  });
});
