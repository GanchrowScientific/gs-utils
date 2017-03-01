/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';
import * as os from 'os';

import {isRemoteHost, getNetworkIP} from '../src/hostName';

module.exports = {
  testIsRemoteHost(test: nodeunit.Test) {
    test.ok(!isRemoteHost(''));
    test.ok(!isRemoteHost(null));
    test.ok(!isRemoteHost(false));
    test.ok(!isRemoteHost(undefined));
    test.ok(!isRemoteHost(0));
    test.ok(!isRemoteHost('localhost'));
    test.ok(!isRemoteHost('127.0.0.1'));
    test.ok(isRemoteHost('notlocal'));
    test.ok(isRemoteHost('1.2.3.4'));
    test.done();
  },

  testGetNetworkIpNoNetwork(test: nodeunit.Test) {
    let originalNetworkInterfaces = os.networkInterfaces;
    try {
      (<any> os).networkInterfaces = () => { /**/ };
      test.equal(getNetworkIP(), '');

    } catch (e) {
      test.ok(false, e.message);
    }

    (<any> os).networkInterfaces = originalNetworkInterfaces;
    test.done();
  }
};
