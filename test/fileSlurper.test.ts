/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as path from 'path';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';

import {FileSlurper} from '../src/fileSlurper';

const test = testWrapper.init(expect);

describe('FileSlurper', () => {
  it('should text file slurp', done => {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file1.txt'));
    let count = 0;
    s.slurp().subscribe(line => {
      test.strictEqual(line, `line${++count}`);
    }, (err) => {
      test.ok(false, err);
      done();
    }, () => {
      test.strictEqual(count, 3);
      done();
    });
  });

  it('should text file slurp special splitter', done => {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file3.txt'), ',');
    let count = 0;
    s.slurp().subscribe(line => {
      test.strictEqual(line, `line${++count}`);
    }, (err) => {
      test.ok(false, err);
      done();
    }, () => {
      test.strictEqual(count, 3);
      done();
    });
  });

  it('should binary file slurp', done => {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file2.txt.gz'));
    let count = 0;
    s.slurp().subscribe(line => {
      test.strictEqual(line, `line${++count + 3}`);
    }, (err) => {
      test.ok(false, err);
      done();
    }, () => {
      test.strictEqual(count, 3);
      done();
    });
  });

  it('should return is binary', done => {
    let s: any = new FileSlurper('xxx.gz');
    test.ok(s.isBinary);
    s = new FileSlurper('xxx.txt');
    test.ok(!s.isBinary);
    done();
  });
});
