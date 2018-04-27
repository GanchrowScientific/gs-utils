/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import {Backoff} from '../src/backoff';

import * as sinon from 'sinon';
import 'jasmine';

const PRIVATE_CALC_TIME = 'calculateTime';

describe('Backoff', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    this.clock.restore();
  });

  it('should fire', done => {
    let backoff = new Backoff();
    backoff.register(() => {
      backoff.reset();
      expect(true).toBe(true);
      done();
    });
    backoff.fire();
    this.clock.tick(1000);
  });

  it('should use private backoff time', done => {
    let backoff = new Backoff();
    let time = getNow();
    backoff.register(() => {
      let now = getNow();
      backoff.reset();
      expect(now).toEqual(time + 100);
      done();
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  });

  it('should use provided backoff time', done => {
    let interval = 200;
    let backoff = new Backoff({baseInterval: interval});
    let time = getNow();
    backoff.register(() => {
      let now = getNow();
      backoff.reset();
      expect(now).toEqual(time + interval);
      done();
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  });

  it('should backoff a second time', done => {
    let backoff = new Backoff();
    let count = 0;
    let time;
    backoff.register(() => {
      count++;
      if (count === 2) {
        let now = getNow();
        backoff.reset();
        expect(Math.trunc(now)).toEqual(Math.trunc(time + 100 * Math.exp(1 / 10)));
        done();
      } else {
        time = getNow();
        backoff.fire();
        this.clock.tick(backoff[PRIVATE_CALC_TIME]());
      }
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  });

  it('should backoff a third time', done => {
    let backoff = new Backoff();
    let count = 0;
    let time;
    backoff.register(() => {
      count++;
      if (count === 3) {
        let now = getNow();
        backoff.reset();
        expect(Math.trunc(now)).toEqual(Math.trunc(time + 100 * Math.exp(2 / 10)));
        done();
      } else {
        time = getNow();
        backoff.fire();
        this.clock.tick(backoff[PRIVATE_CALC_TIME]());
      }
    });
    backoff.fire();
    this.clock.tick(backoff[PRIVATE_CALC_TIME]());
  });

  it('should end backoff', done => {
    let backoff = new Backoff();
    let count = 0;
    backoff.register(() => {
      count++;
      backoff.fire();
      this.clock.tick(1000);
    });
    backoff.onEnd(() => {
      expect(true).toBe(true);
      expect(count).toEqual(10);
      done();
    });
    backoff.fire();
    this.clock.tick(1000);
  });

  it('should end with retry param', done => {
    let backoff = new Backoff({retries: 2});
    let count = 0;
    backoff.register(() => {
      count++;
      backoff.fire();
      this.clock.tick(1000);
    });
    backoff.onEnd(() => {
      expect(true).toBe(true);
      expect(count).toEqual(2);
      done();
    });
    backoff.fire();
    this.clock.tick(1000);
  });
});

function getNow() {
  return Date.now();
}

