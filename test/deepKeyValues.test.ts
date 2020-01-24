/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { deepKeyValue } from '../src/deepKeyValue';

const test = testWrapper.init(expect);

describe('deepKeyValue', () => {

  let mockObject;

  beforeAll(() => {
    mockObject = {
      key1: 'value1',
      key3: {
        key4: 'value4'
      },
      key5: {
        key6: {
          key7: {
            key8: 'value8'
          }
        }
      },
      key9: ['key10', 'key11', 'key12']
    };
  });

  it('should return correct value for a given key', () => {
    test.strictEqual(deepKeyValue(mockObject, 'key1'), 'value1');
  });

  it('should return correct value for a given composed key', () => {
    test.strictEqual(deepKeyValue(mockObject, 'key5.key6.key7.key8'), 'value8');
  });

  it('should return undefined if the key doesn\'t exist', () => {
    test.strictEqual(deepKeyValue(mockObject, 'key2.key5.key9.key8'), undefined);
  });

  it('should return default value if it was provided', () => {
    test.strictEqual(deepKeyValue(mockObject, 'key2.key5.key9.key8', 'default'), 'default');
    test.strictEqual(deepKeyValue(mockObject, 'key99', 'default'), 'default');
  });

  it('should return value for an array', () => {
    test.strictEqual(deepKeyValue(mockObject, 'key9.0'), 'key10');
    test.strictEqual(deepKeyValue(mockObject, 'key9.1'), 'key11');
    test.strictEqual(deepKeyValue(mockObject, 'key9.2'), 'key12');
  });

});
