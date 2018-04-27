/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as os from 'os';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

import {isRemoteHost, getNetworkIP} from '../src/hostName';

describe('IsRemoteHost', () => {
  it('should return isRemoteHost', () => {
    test.ok(!isRemoteHost(''));
    test.ok(!isRemoteHost(null));
    test.ok(!isRemoteHost(false));
    test.ok(!isRemoteHost(undefined));
    test.ok(!isRemoteHost(0));
    test.ok(!isRemoteHost('localhost'));
    test.ok(!isRemoteHost('127.0.0.1'));
    test.ok(isRemoteHost('notlocal'));
    test.ok(isRemoteHost('1.2.3.4'));
  });

  it('should get network ip no network', () => {
    let originalNetworkInterfaces = os.networkInterfaces;
    try {
      (<any> os).networkInterfaces = () => { /**/ };
      test.strictEqual(getNetworkIP(), '');

    } catch (e) {
      test.ok(false, e.message);
    }

    (<any> os).networkInterfaces = originalNetworkInterfaces;
  });
});
