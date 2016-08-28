/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

/// <reference path="../typings/index.d.ts"/>

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
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
    test.equals(fetcher.fetch('key'), 5);
    test.equals(fetcher.fetch('key1'), 6);
    test.equals(fetcher.fetch('key2'), 7);
    test.equals(fetcher.fetch('key3'), 99);
    test.done();
  }
};
