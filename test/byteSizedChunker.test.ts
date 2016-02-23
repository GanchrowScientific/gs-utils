/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/nodeunit/nodeunit.d.ts"/>

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import {ByteSizedChunker} from '../src/byteSizedChunker';

// tsc is not able to find bufferpack
/* tslint:disable:no-require-imports */
let bufferpack = require('bufferpack');
/* tslint:enable:no-require-imports */

let bsc: ByteSizedChunker, a: string[];
let f = function(x) {
  a.push(x);
};

module.exports = {
  setUp(cb) {
    bsc = new ByteSizedChunker(4, 'L>');
    a = [];
    cb();
  },

  testChunkerOneFullMessaage: function(test: nodeunit.Test) {
    // full message in one chunk
    bsc.forEachCompleteChunk(createMessages('msg1'), f);
    test.deepEqual(a, ['msg1']);
    test.equal((<any>bsc).partial, '');

    test.done();
  },

  testChunkerTwoFullMessaages: function(test: nodeunit.Test) {
    // 2 full messages
    bsc.forEachCompleteChunk(createMessages('msg1', 'msg2'), f);
    test.deepEqual(a, ['msg1', 'msg2']);
    test.equal((<any>bsc).partial, '');

    test.done();
  },

  testChunkerOnePartialAndRest: function(test: nodeunit.Test) {
    // 1 partial message and rest of message later
    let msgs = createMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 5), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(5), f);
    test.deepEqual(a, ['msg1']);
    test.equal((<any>bsc).partial, '');

    test.done();
  },

  testChunkerOnePartialThenPartialAndNextThenRest: function(test: nodeunit.Test) {
    // 1 partial message, 1.5 messages and rest
    let msgs = createMessages('msg1', 'msg2xx', 'msg3xxx');
    bsc.forEachCompleteChunk(msgs.slice(0, 6), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(6, 14), f);
    test.deepEqual(a, ['msg1']);
    bsc.forEachCompleteChunk(msgs.slice(14), f);
    test.deepEqual(a, ['msg1', 'msg2xx', 'msg3xxx']);
    test.equal((<any>bsc).partial, '');

    test.done();
  },

  testChunkerTwoBytesThenRest: function(test: nodeunit.Test) {
    // first 2 bytes of message then rest
    let msgs = createMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 2), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(2), f);
    test.deepEqual(a, ['msg1']);
    test.equal((<any>bsc).partial, '');

    test.done();
  },

  testChunkerFullMessageTwoBytesThenRest: function(test: nodeunit.Test) {
    // full message, next 2 bytes then rest
    let msgs = createMessages('msg1', 'msg2');
    bsc.forEachCompleteChunk(msgs.slice(0, 10), f);
    test.deepEqual(a, ['msg1']);
    bsc.forEachCompleteChunk(msgs.slice(10), f);
    test.deepEqual(a, ['msg1', 'msg2']);
    test.equal((<any>bsc).partial, '');

    test.done();
  }
};


function createMessages(...msgs: string[]): Buffer {
  return msgs.reduce((result: Buffer, msg: string) => {
    return Buffer.concat([result, bufferpack.pack('L>', [msg.length]), new Buffer(msg, 'ascii')]);
  }, new Buffer('', 'ascii'));
}
