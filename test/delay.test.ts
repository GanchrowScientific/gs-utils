/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';
import {delay} from '../src/delay';

module.exports = {
  async testDelay(test: nodeunit.Test) {
    let t = Date.now();
    await delay(1);
    test.ok(Date.now() - t >= 1000);
    t = Date.now();
    await delay(0.5);
    test.ok(Date.now() - t >= 500);
    test.done();
  }
};
