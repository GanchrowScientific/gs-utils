/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { LazyMap } from '../src/lazyMap';

const test = testWrapper.init(expect);

describe('Lazy Map', () => {
  it('should return default value if not defined ', () => {
    let lm = new LazyMap<string, string>(() => 'defaultValue');
    lm.set('key1', 'value1');
    test.strictEqual(lm.ensure('key1'), 'value1');
    test.strictEqual(lm.ensure('key2'), 'defaultValue');
    test.strictEqual(lm.ensure('key3'), 'defaultValue');
  });

  it('should return default value using provided factory in ensure function', () => {
    let lm = new LazyMap<string, string>(() => 'defaultValue');
    lm.set('key1', 'value1');
    test.strictEqual(lm.ensure('key1'), 'value1');
    test.strictEqual(lm.ensure('key2'), 'defaultValue');
    test.strictEqual(lm.ensure('key3', () => 'specificValue'), 'specificValue');
  });

  it('should use the key and the map to build the defaultValue', async () => {
    let lm = new LazyMap<string, string>((map, key) => {
        return `n_${Object.entries(map).length}_${key}`;
    });
    lm.set('key1', 'value1');
    test.strictEqual(await lm.ensure('key1'), 'value1');
    test.strictEqual(await lm.ensure('key2'), 'n_1_key2');
  });
});
