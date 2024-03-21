/* Copyright © 2024 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { objectFromUrlParams } from '../src/objectFromUrlParams';

const test = testWrapper.init(expect);
describe('objectFromUrlParams', () => {
  it('should link / params to object', () => {
    test.deepEqual(objectFromUrlParams('?foo=bar&baz=1,2,3'), { foo: 'bar', baz: '1,2,3' });
    test.deepEqual(objectFromUrlParams('foo=bar&baz=1,2,3'), { foo: 'bar', baz: '1,2,3' });
    test.deepEqual(objectFromUrlParams('http://domain.com?foo=bar&baz=1,2,3'), { foo: 'bar', baz: '1,2,3' });
    test.deepEqual(objectFromUrlParams('http://domain.com/path?foo=bar&baz=1,2,3'), { foo: 'bar', baz: '1,2,3' });
    test.deepEqual(objectFromUrlParams(''), {});
    test.deepEqual(objectFromUrlParams('?'), {});
    test.deepEqual(objectFromUrlParams('howdy partner?'), {});
  });
});
