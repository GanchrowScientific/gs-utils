/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import {testWrapper} from '../../src/jasmineTestWrapper';
import {setOnce} from '../../src/decorators/setOnce';

const test = testWrapper.init(expect);

const NO_VALUE_SET_ERROR = new Error('No value set!');
const SOME_VALUE = 'Norton';
const SOME_OTHER_VALUE = 'Philosopher';

let c: C;
let cc: C;

describe('@setOnce', () => {
  beforeEach(() => {
    c = generateTestClassInstance();
    cc = generateTestClassInstance();
  });

  it('should set property once', () => {

    test.strictEqual(c.setOnceProperty, undefined);
    test.strictEqual(cc.setOnceProperty, undefined);

    c.setOnceProperty = SOME_VALUE;
    test.strictEqual(c.setOnceProperty, SOME_VALUE);
    test.strictEqual(cc.setOnceProperty, undefined);

    test.throws(function() { c.setOnceProperty = SOME_OTHER_VALUE; });
    test.strictEqual(c.setOnceProperty, SOME_VALUE);
    test.strictEqual(cc.setOnceProperty, undefined);

    cc.setOnceProperty = SOME_OTHER_VALUE;
    test.strictEqual(c.setOnceProperty, SOME_VALUE);
    test.strictEqual(cc.setOnceProperty, SOME_OTHER_VALUE);

  });

  it('should set property once predefined', () => {

    test.strictEqual(c.setOncePropertyPredefined, SOME_VALUE);
    test.strictEqual(cc.setOncePropertyPredefined, SOME_VALUE);

    test.throws(function() { c.setOncePropertyPredefined = SOME_OTHER_VALUE; });
    test.strictEqual(c.setOncePropertyPredefined, SOME_VALUE);
    test.strictEqual(cc.setOncePropertyPredefined, SOME_VALUE);
  });

  it('should set once accessor', () => {

    test.strictEqual(c.setOnceAccessor, undefined);
    test.strictEqual(cc.setOnceAccessor, undefined);

    c.setOnceAccessor = SOME_VALUE;
    test.strictEqual(c.setOnceAccessor, SOME_VALUE);
    test.strictEqual(cc.setOnceAccessor, undefined);

    test.throws(function() { c.setOnceAccessor = SOME_OTHER_VALUE; });
    test.strictEqual(c.setOnceAccessor, SOME_VALUE);
    test.strictEqual(cc.setOnceAccessor, undefined);

    cc.setOnceAccessor = SOME_OTHER_VALUE;
    test.strictEqual(c.setOnceAccessor, SOME_VALUE);
    test.strictEqual(cc.setOnceAccessor, SOME_OTHER_VALUE);

  });

  it('should set once accessor with get', () => {

    test.throws(() => c.setOnceAccessorWithGet === SOME_OTHER_VALUE, NO_VALUE_SET_ERROR);

    (c as any).setOnceAccessorWithGet = SOME_VALUE;
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.throws(() => cc.setOnceAccessorWithGet === SOME_OTHER_VALUE, NO_VALUE_SET_ERROR);

    test.throws(() => (c as any).setOnceAccessorWithGet = SOME_OTHER_VALUE);
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.throws(() => cc.setOnceAccessorWithGet === SOME_OTHER_VALUE, NO_VALUE_SET_ERROR);

    (cc as any).setOnceAccessorWithGet = SOME_OTHER_VALUE;
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.strictEqual(cc.setOnceAccessorWithGet, SOME_OTHER_VALUE);

  });
});

class C {
  @setOnce
  public setOnceProperty: any;

  @setOnce
  public setOncePropertyPredefined: any = SOME_VALUE;

  @setOnce
  set setOnceAccessor(val: any) { /**/ }

  @setOnce
  get setOnceAccessorWithGet(): any { throw NO_VALUE_SET_ERROR; }
}

function generateTestClassInstance(): C {
  return new C();
}
