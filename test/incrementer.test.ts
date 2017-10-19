/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as nodeunit from 'nodeunit';
import * as sinon from 'sinon';

import {createIncrementer} from '../src/incrementer';

// include this line to fix stack traces
import 'source-map-support/register';

module.exports = {
  setUp(cb) {
    this.clock = sinon.useFakeTimers();
    cb();
  },

  testIncrementer(test: nodeunit.Test) {
    let incrementer = createIncrementer();
    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.incr('hello'), undefined);
    test.strictEqual(incrementer.get('hello'), 1);
    test.strictEqual(incrementer.clear('hello'), true);
    test.strictEqual(incrementer.get('hello'), 0);
    test.done();
  },

  testIncrementer2(test: nodeunit.Test) {
    let incrementer = createIncrementer();
    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.incr('hello', 2), undefined);
    test.strictEqual(incrementer.get('hello'), 2);
    test.strictEqual(incrementer.incr('hello', -3), undefined);
    test.strictEqual(incrementer.get('hello'), -1);
    test.strictEqual(incrementer.clear('hello'), true);
    test.strictEqual(incrementer.get('hello'), 0);
    test.done();
  },

  testIncrementerIdleTime(test: nodeunit.Test) {
    let incrementer = createIncrementer(10000, 30000);
    test.strictEqual(incrementer.incr('hello', 2), undefined);
    this.clock.tick(10000);
    test.strictEqual(incrementer.get('hello'), 2);

    test.strictEqual(incrementer.incr('hello1', 2), undefined);
    this.clock.tick(10001);

    test.strictEqual(incrementer.incr('hello2', 4), undefined);
    this.clock.tick(5000);

    test.strictEqual(incrementer.incr('hello3', 5), undefined);
    this.clock.tick(4999);

    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.get('hello1'), 0);
    test.strictEqual(incrementer.get('hello2'), 4);
    test.strictEqual(incrementer.get('hello3'), 5);
    test.done();
  },

  testIncrementerIdleTime2(test: nodeunit.Test) {
    let incrementer = createIncrementer(10000, 30000);
    test.strictEqual(incrementer.incr('hello', 2), undefined);
    this.clock.tick(10000);
    test.strictEqual(incrementer.get('hello'), 2);

    test.strictEqual(incrementer.incr('hello1', 2), undefined);
    this.clock.tick(10000);

    test.strictEqual(incrementer.incr('hello2', 4), undefined);
    this.clock.tick(5000);

    test.strictEqual(incrementer.incr('hello3', 5), undefined);
    this.clock.tick(5000);

    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.get('hello1'), 0);
    test.strictEqual(incrementer.get('hello2'), 0);
    test.strictEqual(incrementer.get('hello3'), 5);
    test.done();
  },

  tearDown(cb) {
    this.clock.restore();
    cb();
  }
};
