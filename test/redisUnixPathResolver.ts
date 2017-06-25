/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as nodeunit from 'nodeunit';
import * as sinon from 'sinon';

import * as redis from 'redis';

let createClientSpy = sinon.stub(redis, 'createClient');

import {install} from '../src/redisUnixPathResolver';

install();

module.exports = {
  testResolveUnixPath(test: nodeunit.Test) {
    redis.createClient('foobar');
    test.strictEqual(createClientSpy.firstCall.args[0], 'foobar');
    test.ok(createClientSpy.calledOnce);

    redis.createClient({host: 'and', port: 1234});
    test.deepEqual(createClientSpy.secondCall.args[0], {host: 'and', port: 1234});
    test.ok(createClientSpy.calledTwice);

    redis.createClient({host: 'and', port: 1234, path: 'hooha'});
    test.deepEqual(createClientSpy.thirdCall.args[0], {host: 'and', port: 1234});
    test.ok(createClientSpy.calledThrice);

    redis.createClient({host: 'localhost', port: 1234, path: 'hooha'});
    test.deepEqual(createClientSpy.getCall(3).args[0], {path: 'hooha'});
    test.strictEqual(createClientSpy.callCount, 4);

    redis.createClient({host: 'localhost', port: 1234});
    test.deepEqual(createClientSpy.getCall(4).args[0], {host: 'localhost', port: 1234});
    test.strictEqual(createClientSpy.callCount, 5);

    test.done();
  }
};
