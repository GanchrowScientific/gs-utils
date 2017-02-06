/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';

import {Fetch} from '../src/fetch';

module.exports = {
  testFetch(test: nodeunit.Test) {
    let fetcher = new Fetch({
      values: {
        key: 5,
        key1: 6,
        key2: 7
      },
      defaultValue: 99
    });
    test.strictEqual(fetcher.fetch('key'), 5);
    test.strictEqual(fetcher.fetch('key1'), 6);
    test.strictEqual(fetcher.fetch('key2'), 7);
    test.strictEqual(fetcher.fetch('key3'), 99);
    test.done();
  }
};
