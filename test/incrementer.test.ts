/* Copyright © 2017-2018 Ganchrow Scientific, SA all rights reserved */

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';
import {createIncrementer} from '../src/incrementer';

const test = testWrapper.init(expect);

describe('Incrementer', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    this.clock.restore();
  });

  it('should be an incrementer', () => {
    let incrementer = createIncrementer();
    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.incr('hello'), undefined);
    test.strictEqual(incrementer.get('hello'), 1);
    test.strictEqual(incrementer.clear('hello'), true);
    test.strictEqual(incrementer.get('hello'), 0);
  });

  it('should be another incrementer', () => {
    let incrementer = createIncrementer();
    test.strictEqual(incrementer.get('hello'), 0);
    test.strictEqual(incrementer.incr('hello', 2), undefined);
    test.strictEqual(incrementer.get('hello'), 2);
    test.strictEqual(incrementer.incr('hello', -3), undefined);
    test.strictEqual(incrementer.get('hello'), -1);
    test.strictEqual(incrementer.clear('hello'), true);
    test.strictEqual(incrementer.get('hello'), 0);
  });

  it('should be an incrementer with idle time', () => {
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
  });

  it('should be another incrementer with idle time', () => {
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
  });
});
