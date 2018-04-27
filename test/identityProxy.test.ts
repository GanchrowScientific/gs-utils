/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {identityProxy} from '../src/identityProxy';

import 'jasmine';

import {testWrapper} from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

describe('IdentityProxy', () => {
  it('should be an identity proxy', () => {
    let proxy: any = identityProxy();
    test.strictEqual(proxy[5], '5');
    test.strictEqual(proxy.foobar, 'foobar');
    let und = undefined;
    test.strictEqual(proxy[und], 'undefined');
  });
});
