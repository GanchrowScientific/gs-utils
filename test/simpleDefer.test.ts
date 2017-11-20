/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';

import * as defer from '../src/simpleDefer';

module.exports = {
  testSimpleDefer(test: nodeunit.Test) {
    let deferred: defer.Deferred<number> = defer.defer();
    deferred.promise.then(res => {
      test.strictEqual(res, 5);
      test.done();
    }).catch(e => {
      test.ok(false, e);
      test.done();
    });
    deferred.resolve(5);
  },

  testSimpleDeferReject(test: nodeunit.Test) {
    let deferred: defer.Deferred<number> = defer.defer();
    deferred.promise.then(res => {
      test.ok(false);
      test.done();
    }).catch(e => {
      test.strictEqual(e.message, 'Howdy');
      test.done();
    });
    deferred.reject(new Error('Howdy'));
  },

  async testSimpleDeferAsyncSyntax(test: nodeunit.Test) {
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
      test.done();
    }
  },

  async testSimpleDeferRejectAsyncSyntax(test: nodeunit.Test) {
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
      test.done();
    }
  }
};

