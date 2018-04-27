/* Copyright © 2017-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';
import {delay} from '../src/delay';

const test = testWrapper.init(expect);

describe('Delay', () => {
  it('should delay', async done => {
    let t = Date.now();
    await delay(1);
    test.ok(Date.now() - t >= 1000);
    t = Date.now();
    await delay(0.5);
    test.ok(Date.now() - t >= 500);
    done();
  });
});
