/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

/// <reference path="../typings/index.d.ts"/>

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import {RedisAtomicDataLoader} from '../src/redisAtomicDataLoader';

const HAS_PERSISTENCE = 'isPersisted';
const EMIT_KEY = 'emit';

const COMMANDS = [
  'duplicate',
  'eval',
  'on'
];

let client: any;

module.exports = {
  setUp(callback) {
    client = createFakeRedis();
    callback();
  },

  testLoad(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { key1: 9 });
    rmc.load();
    test.ok(!rmc[HAS_PERSISTENCE]);
    test.ok(client.eval.calledOnce);
    test.strictEqual(client.eval.getCall(0).args[2], JSON.stringify({ key1: 9 }));

    rmc.on('done', val => {
      test.strictEqual(val, 'result');
      test.done();
    });
    rmc.on('error', val => {
      test.ok(false, 'Should not call error');
      test.done();
    });
    client.eval.getCall(0).args[3](null, '"result"');
  },

  testLoadWithError(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { key1: 9 });
    rmc.load();
    test.ok(!rmc[HAS_PERSISTENCE]);
    test.ok(client.eval.calledOnce);
    test.strictEqual(client.eval.getCall(0).args[2], JSON.stringify({ key1: 9 }));

    rmc.on('done', val => {
      test.ok(false, 'Should not call done');
      test.done();
    });
    rmc.on('error', val => {
      test.strictEqual(val, 'error');
      test.done();
    });
    client.eval.getCall(0).args[3]('error', 'result');
  },

  testLoadPartialKey(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { key1: 9, key2: 10 });
    rmc.load('key1');
    rmc.load('key2');
    test.ok(client.eval.calledTwice);
    test.strictEqual(client.eval.getCall(0).args[2], JSON.stringify({ key1: 9 }));
    test.strictEqual(client.eval.getCall(1).args[2], JSON.stringify({ key2: 10 }));
    test.done();
  },

  testLoadInvalidPartialKey(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { key1: 9, key2: 10 });
    rmc.on('done', val => {
      test.ok(false, 'Should not call done');
      test.done();
    });
    rmc.on('error', err => {
      test.strictEqual(err.message, 'Invalid config key key3');
      test.strictEqual(client.eval.callCount, 0);
      test.done();
    });
    rmc.load('key3');
  },

  testPersistence(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { persist: 'hey' });
    test.ok(rmc[HAS_PERSISTENCE]);
    test.done();
  },

  testSubscribe(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, {});
    let spy = sinon.spy();
    rmc.subscribe('my-channel', spy);
    test.ok(client.duplicate().subscribe.calledOnce);
    test.ok(client.duplicate().on.calledOnce);
    test.ok(client.duplicate().subscribe.calledWithExactly('my-channel'));

    client.duplicate().on.firstCall.args[1]('my-channel', 'my-message');
    test.strictEqual(spy.callCount, 1);
    test.deepEqual(spy.firstCall.args, ['my-message', 'my-channel']);
    test.done();
  },

  testPsubscribe(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, {});
    let spy = sinon.spy();
    rmc.psubscribe('my-channel', spy);
    test.ok(client.duplicate().psubscribe.calledOnce);
    test.ok(client.duplicate().on.calledOnce);
    test.ok(client.duplicate().psubscribe.calledWithExactly('my-channel'));

    client.duplicate().on.firstCall.args[1]('my-pattern', 'my-channel', 'my-message');
    test.deepEqual(spy.firstCall.args, ['my-message', 'my-pattern', 'my-channel']);
    test.done();
  },

  testLoadWithPersistence(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, { persist: 'hey' });
    rmc.load();
    test.ok(rmc[HAS_PERSISTENCE]);
    rmc[EMIT_KEY]('done', null);
    rmc[EMIT_KEY]('done', null);
    test.ok(client.duplicate().subscribe.calledOnce);
    test.ok(client.duplicate().on.calledOnce);
    test.ok(client.duplicate().subscribe.calledWithExactly('hey'));
    test.done();
  },

  testLoadWithNoPersistence(test: nodeunit.Test) {
    let rmc = new RedisAtomicDataLoader(client, {});
    rmc.load();
    test.ok(!rmc[HAS_PERSISTENCE]);
    rmc[EMIT_KEY]('done', null);
    test.ok(!client.duplicate().subscribe.calledOnce);
    test.ok(!client.duplicate().on.calledOnce);
    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

function createFakeRedis(commands = COMMANDS) {
  let cmdObj: any = {};
  commands.forEach(cmd => {
    cmdObj[cmd] = sinon.stub();
    if (cmd === 'duplicate') {
      cmdObj[cmd].returns({
        on: sinon.stub(),
        psubscribe: sinon.stub(),
        subscribe: sinon.stub()
      });
    }
  });
  return cmdObj;
}
