/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import {Backoff} from '../src/backoff';

import * as nodeunit from 'nodeunit';
import * as sinon from 'sinon';

const PRIVATE_CALC_TIME = 'calculateTime';

module.exports = {
  setUp: function(callback) {
    this.clock = sinon.useFakeTimers();
    callback();
  },

  testFire: function(test: nodeunit.Test) {
    let backoff = new Backoff();
    backoff.register(() => {
      backoff.reset();
      test.ok(true);
      test.done();
    });
    backoff.fire();
    this.clock.tick(1000);
  },

  testBackoffTime: function(test: nodeunit.Test) {
    let backoff = new Backoff();
    let time = getNow();
    backoff.register(() => {
      let now = getNow();
      backoff.reset();
      test.strictEqual(now, time + 100);
      test.done();
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  },

  testBackoffParamTime: function(test: nodeunit.Test) {
    let interval = 200;
    let backoff = new Backoff({baseInterval: interval});
    let time = getNow();
    backoff.register(() => {
      let now = getNow();
      backoff.reset();
      test.strictEqual(now, time + interval);
      test.done();
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  },

  testBackoffSecondTime: function(test: nodeunit.Test) {
    let backoff = new Backoff();
    let count = 0;
    let time;
    backoff.register(() => {
      count++;
      if (count === 2) {
        let now = getNow();
        backoff.reset();
        test.strictEqual(Math.trunc(now), Math.trunc(time + 100 * Math.exp(1 / 10)));
        test.done();
      } else {
        time = getNow();
        backoff.fire();
        this.clock.tick(backoff[PRIVATE_CALC_TIME]());
      }
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  },

  testBackoffThirdTime: function(test: nodeunit.Test) {
    let backoff = new Backoff();
    let count = 0;
    let time;
    backoff.register(() => {
      count++;
      if (count === 3) {
        let now = getNow();
        backoff.reset();
        test.strictEqual(Math.trunc(now), Math.trunc(time + 100 * Math.exp(2 / 10)));
        test.done();
      } else {
        time = getNow();
        backoff.fire();
        this.clock.tick(backoff[PRIVATE_CALC_TIME]());
      }
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  },

  testBackoffEnds: function(test: nodeunit.Test) {
    let backoff = new Backoff();
    let count = 0;
    backoff.register(() => {
      count++;
      backoff.fire();
      this.clock.tick(1000);
    });
    backoff.onEnd(() => {
      test.ok(true);
      test.strictEqual(count, 10);
      test.done();
    });
    backoff.fire();
    this.clock.tick(1000);
  },

  testBackoffEndsRetryParam: function(test: nodeunit.Test) {
    let backoff = new Backoff({retries: 2});
    let count = 0;
    backoff.register(() => {
      count++;
      backoff.fire();
      this.clock.tick(1000);
    });
    backoff.onEnd(() => {
      test.ok(true);
      test.strictEqual(count, 2);
      test.done();
    });
    backoff.fire();
    this.clock.tick(1000);
  },

  tearDown: function(callback) {
    this.clock.restore();
    callback();
  }
};

function getNow() {
  return Date.now();
};

