/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

import 'source-map-support/register';
import 'jasmine';

import { EventEmitter } from 'events';

import { testWrapper } from '../src/jasmineTestWrapper';
import { mockRequireClass } from '../src/mockRequire';

const test = testWrapper.init(expect);

describe('Mock Require', () => {
  it ('should mock events api through require', () => {
    let evt = new EventEmitter();
    let reached = false;
    evt.on('foo', b => {
      reached = true;
      test.strictEqual(b, 1);
    });
    evt.emit('foo', 1);
    mockRequireClass('events', 'EventEmitter', ['emit', 'on']);
    evt = new EventEmitter(); // tslint:disable-line
    let notReached = true;
    evt.on('bar', b => {
      notReached = false;
      test.strictEqual(b, 5);
    });
    evt.emit('bar', 5);
    test.strictEqual(notReached, true);
    test.strictEqual(reached, true);
  });
});
