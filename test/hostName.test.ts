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
      test.ok(isLocalHost('localhost'));
      test.ok(isLocalHost('127.0.0.1'));
      test.ok(!isLocalHost('notlocal'));
      test.ok(!isLocalHost('1.2.3.4'));
      test.ok(isLocalHost('some.host'));
    });

    it('should not resolve hostnames containing shell metacharacters', () => {
      const resolveSpy = sinon.stub().returns('10.10.10.10');
      const { isLocalHost } = createMocks(networkInterfacesSpy, resolveSpy);

      // dns-sync builds an unquoted shell command, so these must never reach it
      [
        'a;id',
        'a b',
        'some.host;touch /tmp/pwn',
        'some.host|id',
        '$(id)',
        '`id`',
        'some.host\nid',
        `${'a'.repeat(254)}`,
        '-',
        1234
      ].forEach(host => {
        test.ok(!isLocalHost(host as any), `resolved suspect host ${JSON.stringify(host)}`);
      });

      // falsy hosts keep their existing "treat as local" semantics, but still skip dns-sync
      ['', null, undefined].forEach(host => {
        test.ok(isLocalHost(host as any));
      });

      test.strictEqual(resolveSpy.callCount, 0);
    });

    it('should still resolve legitimate hostnames', () => {
      const resolveSpy = sinon.stub().returns('10.10.10.10');
      const { isLocalHost } = createMocks(networkInterfacesSpy, resolveSpy);

      ['some.host', 'host-name', 'a.b.c.d.example.com', '10.8.0.9', 'HOST'].forEach(host => {
        test.ok(isLocalHost(host), `failed to resolve valid host ${host}`);
      });

      test.strictEqual(resolveSpy.callCount, 5);
    });

  });
});

function createMocks(networkInterfacesSpy, resolveSpy?) {
  return proxyquire('../src/hostName',
  {
    'dns-sync': {
      resolve: resolveSpy || ((host) => host === 'some.host' ? '10.10.10.10' : null)
    },
    os:  {
      networkInterfaces: networkInterfacesSpy
    }
  });
}
