/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';
import * as path from 'path';

import {FileSlurper} from '../src/fileSlurper';

module.exports = {
  testTextFileSlurp(test: nodeunit.Test) {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file1.txt'));
    let count = 0;
    s.slurp().subscribe(line => {
      test.equal(line, `line${++count}`);
    }, (err) => {
      test.ok(false, err);
      test.done();
    }, () => {
      test.equal(count, 3);
      test.done();
    });
  },

  testTextFileSlurpSpecialSplitter(test: nodeunit.Test) {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file3.txt'), ',');
    let count = 0;
    s.slurp().subscribe(line => {
      test.equal(line, `line${++count}`);
    }, (err) => {
      test.ok(false, err);
      test.done();
    }, () => {
      test.equal(count, 3);
      test.done();
    });
  },

  testBinaryFileSlurp(test: nodeunit.Test) {
    let s = new FileSlurper(path.join(__dirname, 'resources/slurper/file2.txt.gz'));
    let count = 0;
    s.slurp().subscribe(line => {
      test.equal(line, `line${++count + 3}`);
    }, (err) => {
      test.ok(false, err);
      test.done();
    }, () => {
      test.equal(count, 3);
      test.done();
    });
  },

  testIsBinary(test: nodeunit.Test) {
    let s: any = new FileSlurper('xxx.gz');
    test.ok(s.isBinary);
    s = new FileSlurper('xxx.txt');
    test.ok(!s.isBinary);
    test.done();
  }
};
