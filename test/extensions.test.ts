/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';


// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';

import '../src/extensions';

const test = testWrapper.init(expect);

describe('Extensions', () => {
  it('should compact array', () => {
    let arr = [];
    arr[3] = 4;
    test.deepEqual(arr.compact(), [4]);
    test.strictEqual(arr.compact().shift(), 4);
    // test mutability
    test.deepEqual(arr, [, , , 4]);
  });

  it('should return object values', () => {
    let obj = { a: 1, b: 2, c: 3, d: 4, e: 5, A: 11, Z: -9, w: undefined, x: 'foo' };
    let expected = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        expected.push(obj[key]);
      }
    }

    test.deepEqual(Object.values(obj), expected, 'Object.values returns in same order as for..in');

    Object.defineProperty(obj, 'nonenumerable', { value: 7 });
    test.deepEqual(Object.values(obj), expected, 'Non-enumerable properties are excluded');

    test.strictEqual(JSON.stringify({}), JSON.stringify(Object.create(expected)), 'Proptotype properties are excluded.');
  });
});
