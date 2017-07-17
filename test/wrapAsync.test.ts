/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as nodeunit from 'nodeunit';
import {wrapAsync} from '../src/wrapAsync';

module.exports = {
  async testWrapAsync(test: nodeunit.Test) {
    let asyncCBFunction = (arg: any, cb: (err, res) => void) => {
      setTimeout(() => {
        cb(null, arg);
      }, 1);
    };
    let response = await wrapAsync(asyncCBFunction, 'hello');
    test.strictEqual(response, 'hello');
    test.done();
  },

  async testWrapAsyncMultiArgs(test: nodeunit.Test) {
    let asyncCBFunction = (arg: any, arg1: any, cb: (err, res) => void) => {
      setTimeout(() => {
        cb(null, [arg, arg1]);
      }, 1);
    };
    let response = await wrapAsync(asyncCBFunction, 'hello', 'there');
    test.deepEqual(response, ['hello', 'there']);
    test.done();
  },

  async testWrapAsyncError(test: nodeunit.Test) {
    let asyncCBFunction = (arg: any, arg1: any, cb: (err, res) => void) => {
      setTimeout(() => {
        cb(new Error('toasty'), [arg, arg1]);
      }, 1);
    };
    try {
      let response = await wrapAsync(asyncCBFunction, 'hello', 'there');
      test.ok(false);
      test.ok(!response);
    } catch (e) {
      test.strictEqual(e.message, 'toasty');
    }
    test.done();
  }
};
