/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="typings/node/node.d.ts"/>
/// <reference path="typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import '../src/extensions';

module.exports = {
  setUp: function(callback) {
    callback();
  },

  testArrayCompact: function(test: nodeunit.Test) {
    let arr = [];
    arr[3] = 4;
    test.deepEqual(arr.compact(), [4]);
    test.equals(arr.compact().shift(), 4);
    // test mutability
    test.deepEqual(arr, [, , , 4]);
    test.done();
  },

  testObjectValues: function(test: nodeunit.Test) {
    let obj = { a: 1, b: 2, c: 3, d: 4, e: 5, A: 11, Z: -9, w: undefined, x: 'foo' };
    let expected = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        expected.push(obj[key]);
      }
    }

    Object.keys(obj).map((key) => obj[key]);
    test.deepEqual(Object.values(obj), expected, 'Object.values returns in same order as for..in');

    Object.defineProperty(obj, 'nonenumerable', { value: 7 });
    test.deepEqual(Object.values(obj), expected, 'Non-enumerable properties are excluded');

    test.deepEqual([], Object.create(expected), 'Proptotype properties are excluded.');

    test.done();
  },

  tearDown: function(callback) {
    callback();
  }
};
