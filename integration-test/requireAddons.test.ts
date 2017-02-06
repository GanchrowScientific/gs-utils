/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {isObject} from '../src/utilities';
import * as math from '../src/math';

import * as nodeunit from 'nodeunit';

module.exports = {
  testMathIsObject(test: nodeunit.Test) {
    test.ok(isObject(math));
    test.done();
  }
}
