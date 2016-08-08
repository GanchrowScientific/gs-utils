/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import {GSThrottle} from '../src/throttle';
let clock;

module.exports = {
  setUp(callback) {
    clock = sinon.useFakeTimers();
    callback();
  },

  testThrottleHardDelay(test: nodeunit.Test) {
    let throttle = new GSThrottle(1000);
    throttle.callback(() => {
      test.ok(true);
    });
    throttle.more();
    clock.tick(1001);
    test.done();
  },

  testThrottleHardDelayNotYet(test: nodeunit.Test) {
    let throttle = new GSThrottle(1000);
    throttle.callback(() => {
      test.ok(false);
    });
    throttle.more();
    clock.tick(999);
    test.done();
  },

  testThrottleHardDelayWithSoftDelay(test: nodeunit.Test) {
    let throttle = new GSThrottle(2000, 1000);
    throttle.callback((arg) => {
      test.equals(arg, 3);
    });
    throttle.more(1);
    clock.tick(999);
    throttle.more(2);
    clock.tick(999);
    throttle.more(3);
    clock.tick(3);
    test.done();
  },

  testThrottleHardDelayWithSoftDelay2(test: nodeunit.Test) {
    let throttle = new GSThrottle(2000, 1000);
    throttle.callback((arg) => {
      test.equals(arg, 2);
    });
    throttle.more(1);
    clock.tick(999);
    throttle.more(2);
    clock.tick(1002);
    throttle.more(3);
    clock.tick(3);
    test.done();
  },

  tearDown(callback) {
    clock.restore();
    callback();
  }
};
