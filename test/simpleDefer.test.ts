/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import * as defer from '../src/simpleDefer';

import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

describe('simpleDefer', () => {
  it('should resolve simple defer', done => {
    let deferred: defer.Deferred<number> = defer.defer();
    deferred.promise.then(res => {
      test.strictEqual(res, 5);
      done();
    }).catch(e => {
      test.ok(false, e);
      done();
    });
    deferred.resolve(5);
  });

  it('should reject simple defer', done => {
    let deferred: defer.Deferred<number> = defer.defer();
    deferred.promise.then(res => {
      test.ok(false);
      done();
    }).catch(e => {
      test.strictEqual(e.message, 'Howdy');
      done();
    });
    deferred.reject(new Error('Howdy'));
  });

  it('should resolve simple defer async syntax', async done => {
    let deferred: defer.Deferred<number> = defer.defer();
    process.nextTick(() => {
      deferred.resolve(10);
    });
    try {
      let res = await deferred.promise;
      test.strictEqual(res, 10);
    } catch (e) {
      test.ok(false, e);
    } finally {
      done();
    }
  });

  it('should reject simple defer async syntax', async done => {
    let deferred: defer.Deferred<number> = defer.defer();
    process.nextTick(() => {
      deferred.reject(new Error('Partner!'));
    });
    try {
      // Would be nice if typescript complained about the void promise resolution
      await deferred.promise;
      test.ok(false);
    } catch (e) {
      test.strictEqual(e.message, 'Partner!');
    } finally {
      done();
    }
  });
});

