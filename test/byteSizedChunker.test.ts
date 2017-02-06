/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';

import {ByteSizedChunker} from '../src/byteSizedChunker';
import * as bufferpack from 'bufferpack';

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

  testPrepareMessage: function(test: nodeunit.Test) {
    test.deepEqual([bsc.prepare('test')],
      [Buffer.concat([new Buffer([0, 0, 0, 4]), new Buffer('test')])]
    );
    test.done();
  },

  testPrepareMessageBuffer: function(test: nodeunit.Test) {
    test.deepEqual([bsc.prepare(new Buffer('test'))],
      [Buffer.concat([new Buffer([0, 0, 0, 4]), new Buffer('test')])]
    );
    test.done();
  },

  testChunkerOneFullMessage: function(test: nodeunit.Test) {
    // full message in one chunk
    bsc.forEachCompleteChunk(createASCIIMessages('msg1'), f);
    test.deepEqual(a, [new Buffer('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunkerTwoFullMessaages: function(test: nodeunit.Test) {
    // 2 full messages
    bsc.forEachCompleteChunk(createASCIIMessages('msg1', 'msg2'), f);
    test.deepEqual(a, [new Buffer('msg1'), new Buffer('msg2')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunkerOnePartialAndRest: function(test: nodeunit.Test) {
    // 1 partial message and rest of message later
    let msgs = createASCIIMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 5), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(5), f);
    test.deepEqual(a, [new Buffer('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunkerOnePartialThenPartialAndNextThenRest: function(test: nodeunit.Test) {
    // 1 partial message, 1.5 messages and rest
    let msgs = createASCIIMessages('msg1', 'msg2xx', 'msg3xxx');
    bsc.forEachCompleteChunk(msgs.slice(0, 6), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(6, 14), f);
    test.deepEqual(a, [new Buffer('msg1')]);
    bsc.forEachCompleteChunk(msgs.slice(14), f);
    test.deepEqual(a, [new Buffer('msg1'), new Buffer('msg2xx'), new Buffer('msg3xxx')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunkerTwoBytesThenRest: function(test: nodeunit.Test) {
    // first 2 bytes of message then rest
    let msgs = createASCIIMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 2), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(2), f);
    test.deepEqual(a, [new Buffer('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunkerFullMessageTwoBytesThenRest: function(test: nodeunit.Test) {
    // full message, next 2 bytes then rest
    let msgs = createASCIIMessages('msg1', 'msg2');
    bsc.forEachCompleteChunk(msgs.slice(0, 10), f);
    test.deepEqual(a, [new Buffer('msg1')]);
    bsc.forEachCompleteChunk(msgs.slice(10), f);
    test.deepEqual(a, [new Buffer('msg1'), new Buffer('msg2')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

    test.done();
  },

  testChunker8BitClean: function(test: nodeunit.Test) {
    let byteBuffer = new Buffer(6);
    byteBuffer[0] = 56;
    byteBuffer[1] = 66;
    byteBuffer[2] = 73;
    byteBuffer[3] = 84;
    byteBuffer[4] = 194;
    byteBuffer[5] = 169;
    bsc.forEachCompleteChunk(createMessages(byteBuffer), f);
    test.deepEqual(a, [new Buffer('8BIT©')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
    test.done();
  }
};

function createASCIIMessages(...msgs: string[]): Buffer {
  return msgs.reduce((result: Buffer, msg: string) => {
    return Buffer.concat([result, bufferpack.pack('L>', [msg.length]), new Buffer(msg, 'ascii')]);
  }, new Buffer('', 'ascii'));
}

function createMessages(...msgs: Buffer[]): Buffer {
  return msgs.reduce((result: Buffer|string, msg: Buffer) => {
    return Buffer.concat([result, bufferpack.pack('L>', [msg.length]), msg]);
  }, new Buffer(0));
}
