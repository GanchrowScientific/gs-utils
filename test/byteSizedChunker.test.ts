/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as bufferpack from 'bufferpack';

import 'jasmine';

import {ByteSizedChunker} from '../src/byteSizedChunker';
import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

let bsc: ByteSizedChunker, a: string[];
let f = function(x) {
  a.push(x);
};

describe('ByteSizedChunker', () => {
  beforeEach(() => {
    bsc = new ByteSizedChunker(4, 'L>');
    a = [];
  });

  it('should prepare message', () => {
    test.deepEqual([bsc.prepare('test')],
      [Buffer.concat([Buffer.from([0, 0, 0, 4]), Buffer.from('test')])]
    );
  });

  it('should prepare buffer message', () => {
    test.deepEqual([bsc.prepare(Buffer.from('test'))],
      [Buffer.concat([Buffer.from([0, 0, 0, 4]), Buffer.from('test')])]
    );
  });

  it('should chunk one full message', () => {
    // full message in one chunk
    bsc.forEachCompleteChunk(createASCIIMessages('msg1'), f);
    test.deepEqual(a, [Buffer.from('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

  });

  it('should chunk two messages', () => {
    // 2 full messages
    bsc.forEachCompleteChunk(createASCIIMessages('msg1', 'msg2'), f);
    test.deepEqual(a, [Buffer.from('msg1'), Buffer.from('msg2')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
  });

  it('should chunk one partial and the rest', () => {
    // 1 partial message and rest of message later
    let msgs = createASCIIMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 5), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(5), f);
    test.deepEqual(a, [Buffer.from('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');

  });

  it('should chunk one partial then partial and next rest', () => {
    // 1 partial message, 1.5 messages and rest
    let msgs = createASCIIMessages('msg1', 'msg2xx', 'msg3xxx');
    bsc.forEachCompleteChunk(msgs.slice(0, 6), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(6, 14), f);
    test.deepEqual(a, [Buffer.from('msg1')]);
    bsc.forEachCompleteChunk(msgs.slice(14), f);
    test.deepEqual(a, [Buffer.from('msg1'), Buffer.from('msg2xx'), Buffer.from('msg3xxx')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
  });

  it('should chunk two bytes then rest', () => {
    // first 2 bytes of message then rest
    let msgs = createASCIIMessages('msg1');
    bsc.forEachCompleteChunk(msgs.slice(0, 2), f);
    test.deepEqual(a, []);
    bsc.forEachCompleteChunk(msgs.slice(2), f);
    test.deepEqual(a, [Buffer.from('msg1')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
  });

  it('should chunk full message two bytes then rest', () => {
    // full message, next 2 bytes then rest
    let msgs = createASCIIMessages('msg1', 'msg2');
    bsc.forEachCompleteChunk(msgs.slice(0, 10), f);
    test.deepEqual(a, [Buffer.from('msg1')]);
    bsc.forEachCompleteChunk(msgs.slice(10), f);
    test.deepEqual(a, [Buffer.from('msg1'), Buffer.from('msg2')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
  });

  it('should chunk 8 bit clean', () => {
    let byteBuffer = Buffer.alloc(6);
    byteBuffer[0] = 56;
    byteBuffer[1] = 66;
    byteBuffer[2] = 73;
    byteBuffer[3] = 84;
    byteBuffer[4] = 194;
    byteBuffer[5] = 169;
    bsc.forEachCompleteChunk(createMessages(byteBuffer), f);
    test.deepEqual(a, [Buffer.from('8BIT©')]);
    test.strictEqual((<any>bsc).partial.toString('utf8'), '');
  });
});

function createASCIIMessages(...msgs: string[]): Buffer {
  return msgs.reduce((result: Buffer, msg: string) => {
    return Buffer.concat([result, bufferpack.pack('L>', [msg.length]), Buffer.from(msg, 'ascii')]);
  }, Buffer.from('', 'ascii'));
}

function createMessages(...msgs: Buffer[]): Buffer {
  return msgs.reduce((result: Buffer|string, msg: Buffer) => {
    return Buffer.concat([result, bufferpack.pack('L>', [msg.length]), msg]);
  }, Buffer.alloc(0));
}
