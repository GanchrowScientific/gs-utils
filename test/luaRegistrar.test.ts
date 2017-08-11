/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import * as nodeunit from 'nodeunit';
import * as shasum from 'shasum';

import {registerScripts, RegisteredScripts, SHA_SYMBOL} from '../src/luaRegistrar';

let scripts: RegisteredScripts;
let client: Record<string, sinon.SinonStub>;
let clock: sinon.SinonFakeTimers;

module.exports = {
  setUp(callback) {
    client = createMockRedisClient();
    clock = sinon.useFakeTimers();
    callback();
  },

  testLoadScripts(test: nodeunit.Test) {
    scripts = register();
    test.deepEqual(Object.keys(scripts), ['a', 'b']);
    test.strictEqual(scripts.a[SHA_SYMBOL], shasum('abcd'));
    test.strictEqual(scripts.b[SHA_SYMBOL], shasum('efgh'));
    test.done();
  },

  async testInvokeScript(test: nodeunit.Test) {
    scripts = register();

    scripts.a({ keys: ['a', 'b'], args: ['c', 'd'] }).then(res => {
      test.strictEqual(res, 'yay!');
      test.done();
    });

    test.strictEqual(client.evalsha.callCount, 1);
    test.deepEqual(client.evalsha.firstCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);
    client.evalsha.firstCall.args[6](null, 'yay!');
  },

  async testRetryNoScript(test: nodeunit.Test) {
    scripts = register();

    scripts.a({ keys: ['a', 'b'], args: ['c', 'd'] }).then(res => {
      test.strictEqual(res, 'yay!');
      test.done();
    });

    test.strictEqual(client.evalsha.callCount, 1);
    test.deepEqual(client.evalsha.firstCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);

    // first call returns no script error
    client.evalsha.firstCall.args[6](new Error('NOSCRIPT'));

    test.strictEqual(client.script.callCount, 1);
    test.deepEqual(client.script.firstCall.args.slice(0, 2), ['LOAD', 'abcd']);

    // load the scripts
    client.script.firstCall.args[2](null, 'yay!');

    clock.restore();
    setTimeout(() => {
      test.strictEqual(client.evalsha.callCount, 2);
      test.deepEqual(client.evalsha.secondCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);

      // call script again
      client.evalsha.firstCall.args[6](null, 'yay!');
    }, 1);

  },

  testRetryBusy(test: nodeunit.Test) {
    retryBusyTest(test);
  },

  testRetryBusyWithTimeout(test: nodeunit.Test) {
    retryBusyTest(test, 3000);
  },

  async testError(test: nodeunit.Test) {
    scripts = register();

    scripts.a({ keys: ['a', 'b'], args: ['c', 'd'] }).catch(err => {
      test.strictEqual(err.message, 'uh oh!');
      test.done();
    });

    test.strictEqual(client.evalsha.callCount, 1);
    test.deepEqual(client.evalsha.firstCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);
    client.evalsha.firstCall.args[6](new Error('uh oh!'), 'yay!');
  },

  testLoadScriptError(test: nodeunit.Test) {
    scripts = register();

    scripts.a({ keys: ['a', 'b'], args: ['c', 'd'] }).catch(err => {
      test.strictEqual(err.message, 'uh oh!');
      test.done();
    });

    test.strictEqual(client.evalsha.callCount, 1);
    test.deepEqual(client.evalsha.firstCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);

    // first call returns no script error
    client.evalsha.firstCall.args[6](new Error('NOSCRIPT'));


    test.strictEqual(client.script.callCount, 1);
    test.deepEqual(client.script.firstCall.args.slice(0, 2), ['LOAD', 'abcd']);

    // error loading scripts
    client.script.firstCall.args[2](new Error('uh oh!'));
  },

  testOtherCommand(test: nodeunit.Test) {
    scripts = register();

    (scripts as any).hgetall('a', 'b').then(res => {
      test.strictEqual(res, 'yay!');
      test.done();
    });

    test.strictEqual(client.hgetall.callCount, 1);
    test.deepEqual(client.hgetall.firstCall.args.slice(0, 2), ['a', 'b']);
    client.hgetall.firstCall.args[2](null, 'yay!');
  },

  testOtherCommandThrowsError(test: nodeunit.Test) {
    scripts = register();

    (scripts as any).hgetall('a', 'b').catch(err => {
      test.strictEqual(err.message, 'uh oh!');
      test.done();
    });

    test.strictEqual(client.hgetall.callCount, 1);
    test.deepEqual(client.hgetall.firstCall.args.slice(0, 2), ['a', 'b']);
    client.hgetall.firstCall.args[2](new Error('uh oh!'));
  },

  tearDown(callback) {
    clock.restore();
    callback();
  }
};


function createMockRedisClient() {
  return {
    evalsha: sinon.stub(),
    script: sinon.stub(),
    hgetall: sinon.stub(),
  };
}

function register(customTimeout?) {
  return registerScripts(client as any, { a: 'abcd', b: 'efgh', }, customTimeout);
}

function retryBusyTest(test: nodeunit.Test, customTimeout?) {
  scripts = register(customTimeout);

  scripts.a({ keys: ['a', 'b'], args: ['c', 'd'] }).then(res => {
    test.strictEqual(res, 'yay!');
    test.done();
  });

  test.strictEqual(client.evalsha.callCount, 1);
  test.deepEqual(client.evalsha.firstCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);

  // first call returns no script error
  client.evalsha.firstCall.args[6](new Error('BUSY'));

  clock.tick(customTimeout || 1000);
  test.strictEqual(client.evalsha.callCount, 2);
  test.deepEqual(client.evalsha.secondCall.args.slice(0, 6), [shasum('abcd'), 2, 'a', 'b', 'c', 'd']);

  // call script again
  client.evalsha.firstCall.args[6](null, 'yay!');
}
