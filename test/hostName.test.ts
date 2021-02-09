/* Copyright © 2016-2021 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as pq from 'proxyquire';
import * as sinon from 'sinon';

import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);
const proxyquire = pq.noPreserveCache();

describe('hostname', () => {

  describe('IsRemoteHost', () => {
    it('should return isRemoteHost', () => {
      const { isRemoteHost } = createMocks(sinon.stub());
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
      const { getNetworkIP } = createMocks(sinon.stub().throwsException());
      try {
        test.strictEqual(getNetworkIP(), '');
      } catch (e) {
        test.ok(false, e.message);
      }
    });
  });

  describe('IsLocalHost', () => {

    const networkInterfacesSpy = sinon.stub().returns({
        en0: [
          {
            address: '10.10.10.10',
            family: 'IPv4',
            internal: false
          }
        ],
        utun2: [
          {
            address: '10.8.0.9',
            family: 'IPv4',
            internal: false
          }
        ]
    });

    it('should return isLocalHost', async () => {
      const { isLocalHost } = createMocks(networkInterfacesSpy);
      test.ok(await isLocalHost('localhost'));
      test.ok(await isLocalHost('127.0.0.1'));
      test.ok(!await isLocalHost('notlocal'));
      test.ok(!await isLocalHost('1.2.3.4'));
      test.ok(await isLocalHost('some.host'));
    });

  });
});

function createMocks(networkInterfacesSpy) {
  return proxyquire('../src/hostName',
  {
    dns: {
      promises: {
        lookup: (host) => {
          if (host === 'some.host') {
            return Promise.resolve({ address: '10.10.10.10' });
          }
          return Promise.reject();
        }
      }
    },
    os:  {
      networkInterfaces: networkInterfacesSpy
    }
  });
}
