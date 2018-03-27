/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as nodeunit from 'nodeunit';

import {between} from '../src/between';

module.exports = {
  testBetween(test: nodeunit.Test) {
    test.ok(between(2, 1, 3));
    test.ok(!between(2, 2, 3));
    test.ok(!between(3, 2, 3));
    [50, 500, 5000, 50000].forEach(n => {
      let iterations = 100;
      while (iterations--) {
        test.ok(between(Math.random() * n + n, n, n * 2));
      }
    });
    test.done();
  }
};
