/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as fs from 'fs';
import * as redis from 'redis';
import * as nodeunit from 'nodeunit';

import {registerScripts, RegisteredScripts, ScriptInvoker, SHA_SYMBOL} from '../src/luaRegistrar';
import {getLogger} from '../src/gsLogger';

type LuaScripts = RegisteredScripts & {
  foo?: ScriptInvoker;
  bar?: ScriptInvoker;
  fooList?: ScriptInvoker;
  raisesError?: ScriptInvoker;
  lrange?: ScriptInvoker;
  script?: ScriptInvoker;
};
const LRANGE_KEY = '__LUA_REGISTRAR_INTEGRATION_TEST__';

let logger = getLogger('luaRegistrar integration test');

let client: redis.RedisClient;
let scripts: LuaScripts;

module.exports = {
  setUp(callback) {
    client = redis.createClient(6380, 'saget', {
      password: 'test_me_sideways'
    });
    scripts = registerScripts(client, loadScripts());
    callback();
  },

  testAllExists(test: nodeunit.Test) {
    test.deepEqual((Object.keys(scripts) || []).sort(),
      ['bar', 'foo', 'fooList', 'raisesError'],
      'Scripts not copied to target folder. Must run ./scripts/test.sh first.');
    test.done();
  },

  async testRegisterScripts(test: nodeunit.Test) {

    // ensure key does not exists if test fails on previous run
    await client.del(LRANGE_KEY);

    try {
      let res = await scripts.foo({
        keys: [],
        args: ['hello', 'man']
      });
      test.strictEqual(res, 'foo:hello:man');
    } catch (e) {
      logger.error(e);
      test.ok(false);
    }

    try {
      let res = await scripts.bar({
        keys: ['hello', 'keys', 'yo'],
        args: ['extra']
      });
      test.strictEqual(res, 'bar,hello,keys,yo,extra');
    } catch (e) {
      logger.error(e);
      test.ok(false);
    }

    try {
      let res = await scripts.fooList({
        keys: [LRANGE_KEY],
        args: ['hello', 'man']
      });
      test.strictEqual(res, 1);
      let resList = await scripts.lrange({args: [ LRANGE_KEY, 0, -1 ] });
      test.deepEqual(resList, ['foo:hello:man']);
    } catch (e) {
      logger.error(e);
      test.ok(false);
    }

    await client.del(LRANGE_KEY);
    test.done();
    client.quit();
  },

  async testHandlesMissingScript(test: nodeunit.Test) {
    let result = await scripts.script({ args: ['FLUSH']});
    test.strictEqual(result, 'OK');
    result = await scripts.script({
      args: [
        'EXISTS',
        scripts.bar[SHA_SYMBOL],
        scripts.foo[SHA_SYMBOL],
        scripts.fooList[SHA_SYMBOL]
      ]});

    test.deepEqual(result, [0, 0, 0], 'No scripts should exist');

    try {
      await Promise.all([scripts.bar({
        keys: ['hello', 'keys', 'yo'],
        args: ['extra']
      }), scripts.foo({
        keys: ['hello', 'keys', 'yo'],
        args: ['extra']
      })]);

      result = await scripts.script({
        args: [
          'EXISTS',
          scripts.bar[SHA_SYMBOL],
          scripts.foo[SHA_SYMBOL],
          scripts.fooList[SHA_SYMBOL]
        ]});
      test.deepEqual(result, [1, 1, 0], 'bar and foo scripts only should exist');
      test.done();
    } catch (e) {
      test.ok(false, e.message);
      test.ok(false, e.stack);
      test.done();
    }
  },

  async testScriptError(test: nodeunit.Test) {
    try {
      await scripts.raisesError();
      test.ok(false, 'Should have raised an error.');
      test.done();
    } catch (e) {
      test.ok(/Script attempted to access nonexistent global variable 'idontexist'/.test(e.message), e.message);
      test.done();
    }
  },

  tearDown(callback) {
    client.script('FLUSH');
    client.quit();
    callback();
  }
};

function loadScripts(): Record<string, string> {
  let s = {};
  fs.readdirSync(`${__dirname}/resources/lua-scripts`).forEach(fileName => {
    s[fileName.substring(0, fileName.length - 4)] = fs.readFileSync(`${__dirname}/resources/lua-scripts/${fileName}`, 'utf8');
  });
  return s;
}
