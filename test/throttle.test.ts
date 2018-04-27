/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import 'jasmine';

import {GSThrottle} from '../src/throttle';

import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

let clock;

describe('GSThrottle', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should throttle hard delay', () => {
    let throttle = new GSThrottle(1000);
    throttle.callback(() => {
      test.ok(true);
    });
    throttle.more();
    clock.tick(1001);
  });

  it('should throttle hard delay not yet', () => {
    let throttle = new GSThrottle(1000);
    throttle.callback(() => {
      test.ok(false);
    });
    throttle.more();
    clock.tick(999);
  });

  it('should throttle hard delay with soft delay', () => {
    let throttle = new GSThrottle(2000, 1000);
    throttle.callback((arg) => {
      test.strictEqual(arg, 3);
    });
    throttle.more(1);
    clock.tick(999);
    throttle.more(2);
    clock.tick(999);
    throttle.more(3);
    clock.tick(3);
  });

  it('should throttle hard delay with soft delay (2)', () => {
    let throttle = new GSThrottle(2000, 1000);
    throttle.callback((arg) => {
      test.strictEqual(arg, 2);
    });
    throttle.more(1);
    clock.tick(999);
    throttle.more(2);
    clock.tick(1002);
    throttle.more(3);
    clock.tick(3);
  });
});
