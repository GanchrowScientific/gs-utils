/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';

import {now, initialTime} from '../src/microtime';

let oldProcessHr = process.hrtime;
let nanos = 0;
let secondIncrement = 0;
let initialSeconds = Math.ceil(initialTime / 1e6);
let initialMicros = initialTime % 1e6;

module.exports = {
  setUp(cb) {
    process.hrtime = () => [
      secondIncrement,
      initialMicros * 1e3 + nanos
    ];
    cb();
  },

  testMicroTime(test: nodeunit.Test) {
    const timeIncrement = 200;

    let prevTime = 0;
    for (let i = 0; i < 1e3; i += timeIncrement) {
      for (let j = 0; j < 1e6; j += 2e4) {
        nanos = j;
        let [seconds] = process.hrtime();
        let actualSeconds = Math.round(now() / 1e6);
        test.ok(Math.abs(actualSeconds - (seconds + initialSeconds)) <= 1, `${actualSeconds} ${seconds + initialSeconds}`);
        test.ok(now() > prevTime, `${now()} ${prevTime}`);
        test.ok(Number.isInteger(now()));
        prevTime = now();
      }
      secondIncrement += timeIncrement;
    }
    test.done();
  },

  tearDown(cb) {
    process.hrtime = oldProcessHr;
    cb();
  }
};
