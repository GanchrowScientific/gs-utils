/* Copyright © 2021 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { hashifyList } from '../src/hashifyList';

const test = testWrapper.init(expect);
describe('hashifyList', () => {
  it('should convert comma separated string into sensical object', () => {
    test.deepEqual(hashifyList('foo,bar,baz,1'), { foo: 'bar', baz: '1' });
    test.deepEqual(hashifyList(''), {});
    test.deepEqual(hashifyList('foo|bar|baz|1', '|'), { foo: 'bar', baz: '1' });
    test.deepEqual(hashifyList('foo|bar|baz|1'), {});
  });
});
