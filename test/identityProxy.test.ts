/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as nodeunit from 'nodeunit';

import {identityProxy} from '../src/identityProxy';

module.exports = {
  testIdentityProxy(test: nodeunit.Test) {
    let proxy: any = identityProxy();
    test.strictEqual(proxy[5], '5');
    test.strictEqual(proxy.foobar, 'foobar');
    let und = undefined;
    test.strictEqual(proxy[und], 'undefined');
    test.done();
  }
};
