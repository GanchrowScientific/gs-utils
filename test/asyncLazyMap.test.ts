/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { AsyncLazyMap } from '../src/asyncLazyMap';

const test = testWrapper.init(expect);

describe('Async Lazy Map', () => {
  it('should return default value if not defined ', async () => {
    let lm = new AsyncLazyMap<string, string>(async () => 'defaultValue');
    lm.set('key1', 'value1');
    test.strictEqual(await lm.ensure('key1'), 'value1');
    test.strictEqual(await lm.ensure('key2'), 'defaultValue');
    test.strictEqual(await lm.ensure('key3'), 'defaultValue');
  });

  it('should return default value using provided factory in ensure function', async () => {
    let lm = new AsyncLazyMap<string, string>(async () => 'defaultValue');
    lm.set('key1', 'value1');
    test.strictEqual(await lm.ensure('key1'), 'value1');
    test.strictEqual(await lm.ensure('key2'), 'defaultValue');
    test.strictEqual(await lm.ensure('key3', async () => 'specificValue'), 'specificValue');
  });

  it('should use the key and the map to build the defaultValue', async () => {
    let lm = new AsyncLazyMap<string, string>((map, key) => {
        return Promise.resolve(`n_${Object.entries(map).length}_${key}`);
    });
    lm.set('key1', 'value1');
    test.strictEqual(await lm.ensure('key1'), 'value1');
    test.strictEqual(await lm.ensure('key2'), 'n_1_key2');
  });
});
