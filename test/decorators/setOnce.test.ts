/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';

import {setOnce} from '../../src/decorators/setOnce';

const NO_VALUE_SET_ERROR = new Error('No value set!');
const SOME_VALUE = 'Norton';
const SOME_OTHER_VALUE = 'Philosopher';

let c: C;
let cc: C;
module.exports = {
  setUp(callback) {
    c = generateTestClassInstance();
    cc = generateTestClassInstance();
    callback();
  },

  testSetOnceProperty(test: nodeunit.Test) {

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

    test.done();
  },

  testSetOncePropertyPredefined(test: nodeunit.Test) {

    test.strictEqual(c.setOncePropertyPredefined, SOME_VALUE);
    test.strictEqual(cc.setOncePropertyPredefined, SOME_VALUE);

    test.throws(function() { c.setOncePropertyPredefined = SOME_OTHER_VALUE; });
    test.strictEqual(c.setOncePropertyPredefined, SOME_VALUE);
    test.strictEqual(cc.setOncePropertyPredefined, SOME_VALUE);

    test.done();
  },

  testSetOnceAccessor(test: nodeunit.Test) {

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

    test.done();
  },

  testSetOnceAccessorWithGet(test: nodeunit.Test) {

    test.throws(() => c.setOnceAccessorWithGet === SOME_OTHER_VALUE, Error, NO_VALUE_SET_ERROR.message);

    (c as any).setOnceAccessorWithGet = SOME_VALUE;
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.throws(() => cc.setOnceAccessorWithGet === SOME_OTHER_VALUE, Error, NO_VALUE_SET_ERROR.message);

    test.throws(() => (c as any).setOnceAccessorWithGet = SOME_OTHER_VALUE);
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.throws(() => cc.setOnceAccessorWithGet === SOME_OTHER_VALUE, Error, NO_VALUE_SET_ERROR.message);

    (cc as any).setOnceAccessorWithGet = SOME_OTHER_VALUE;
    test.strictEqual(c.setOnceAccessorWithGet, SOME_VALUE);
    test.strictEqual(cc.setOnceAccessorWithGet, SOME_OTHER_VALUE);

    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

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
