/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

/// <reference path="../typings/index.d.ts"/>

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import {RedisMultiConfig} from '../src/redisMultiConfig';
import {dup} from '../src/utilities';

const HAS_PERSISTENCE = 'isPersisted';
const EMIT_KEY = 'emit';

const COMMANDS = [
  'multi',
  'subscribe',
  'on',
  'mget',
];

const MULTIABLE_COMMANDS = [
  'lrange',
  'exec',
  'get',
  'keys',
  'hgetall',
  'hget'
];

let client: any;

module.exports = {
  setUp(callback) {
    client = createFakeRedis();
    callback();
  },

  testLoadWithOnlyKeyValue(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: 'test'});
    test.ok(client.multi.calledOnce);
    test.ok(!rmc[HAS_PERSISTENCE]);
    test.ok(client.multi().lrange.calledOnce);
    test.ok(client.multi().lrange.calledWith('test'));
    test.ok(client.multi().exec.calledOnce);
    test.done();
  },

  testLoadWithKeysAndPersistence(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['keys', '*'], persist: 'hey'});
    test.ok(rmc[HAS_PERSISTENCE]);
    test.ok(client.multi().keys.calledOnce);
    client.multi().keys.callArgWith(1, null, ['test']);
    test.ok(client.multi().exec.calledOnce);
    client.multi().exec.callArgWith(0, null, ['test']);
    test.ok(client.mget.calledOnce);
    test.done();
  },

  testLoadWithOtherCommand(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['hget', 'foo', 'bar']});
    test.ok(client.multi().hget.calledOnce);
    test.ok(client.multi().hget.calledWith('foo', 'bar'));
    test.ok(client.multi().exec.calledOnce);

    let otherClient = createFakeRedis();
    rmc = new RedisMultiConfig(otherClient);
    rmc.load({ test: ['hgetall', 'foo']});
    test.ok(otherClient.multi().hgetall.calledOnce);
    test.ok(otherClient.multi().hgetall.calledWith('foo'));
    test.ok(otherClient.multi().exec.calledOnce);


    let otherArbitraryCommands = dup(MULTIABLE_COMMANDS);
    otherArbitraryCommands.push('tinFoilOnMyHead');
    let yetAnotherClient = createFakeRedis(undefined, otherArbitraryCommands);
    rmc = new RedisMultiConfig(yetAnotherClient);
    rmc.load({ test: ['tinFoilOnMyHead', 'arg1', 'arg2', 'arg3']});
    test.ok(yetAnotherClient.multi().tinFoilOnMyHead.calledOnce);
    test.ok(yetAnotherClient.multi().tinFoilOnMyHead.calledWith('arg1', 'arg2', 'arg3'));
    test.ok(yetAnotherClient.multi().exec.calledOnce);
    test.done();
  },

  testLoadWithPersistence(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['keys', '*'], persist: 'hey'});
    test.ok(rmc[HAS_PERSISTENCE]);
    rmc[EMIT_KEY]('done', null);
    rmc[EMIT_KEY]('done', null);
    test.ok(client.subscribe.calledOnce);
    test.ok(client.subscribe.calledWithExactly('hey'));
    test.done();
  },

  testLoadWithNoPersistence(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['keys', '*']});
    test.ok(!rmc[HAS_PERSISTENCE]);
    rmc[EMIT_KEY]('done', null);
    test.ok(!client.subscribe.calledOnce);
    test.done();
  },

  testLoadMultipleKeys(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['get', '5'], anotherTest: ['hget', 'foo', 'bar']});
    test.ok(!rmc[HAS_PERSISTENCE]);
    test.ok(client.multi().get.calledOnce);
    test.ok(client.multi().hget.calledOnce);
    test.done();
  },

  testLoadSubsequently(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['get', '5'], anotherTest: ['hget', 'foo', 'bar']});
    rmc.load(undefined, 'test');
    test.ok(client.multi().get.calledTwice);
    test.ok(client.multi().exec.calledTwice);
    rmc.load(undefined, 'anotherTest');
    test.ok(client.multi().hget.calledTwice);
    test.ok(client.multi().exec.calledThrice);
    test.done();
  },

  testEmittedEvents(test: nodeunit.Test) {
    let rmc = new RedisMultiConfig(client);
    rmc.load({ test: ['get', '5'], anotherTest: ['hget', 'foo', 'bar']});
    rmc.on('each', (item, res) => {
      let arg = res[0];
      if (arg === 'get') {
        test.equals(res[1], 5);
        test.equals(item[0], '5');
      } else if (arg === 'hget') {
        test.equals(res[1], 'foo');
        test.equals(res[2], 'bar');
        test.equals(item[0], 'foo');
        test.equals(item[1], 'bar');
      } else {
        test.ok(false);
      }
    });
    rmc.on('eachError', (item, err) => {
      test.equals(err, 'hget');
      test.equals(item[0], 'foo');
      test.equals(item[1], 'bar');
      test.done();
    });
    client.multi().get.callArgWith(1, null, ['get', 5]);
    client.multi().hget.callArgWith(2, null, ['hget', 'foo', 'bar']);
    client.multi().hget.callArgWith(2, 'hget', null);
  },

  tearDown(callback) {
    callback();
  }
};

function createFakeRedis(commands = COMMANDS, multiable = MULTIABLE_COMMANDS) {
  let cmdObj: any = {};
  commands.forEach(cmd => {
    cmdObj[cmd] = sinon.stub();
    if (cmd === 'multi') {
      let multiCmdObj = {};
      multiable.forEach(mCmd => {
        multiCmdObj[mCmd] = sinon.stub();
      });
      cmdObj[cmd].returns(multiCmdObj);
    }
  });
  return cmdObj;
}
