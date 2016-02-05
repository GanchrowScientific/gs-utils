/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import {BasicObject, isObject, toArray, deepFreeze, isJSON, isXML, dup} from '../../src/utils/utilities';

module.exports = {
  setUp: function(callback) {
    callback();
  },

  testBasicObject: function(test: nodeunit.Test) {
    let b = new BasicObject();

    test.equals(typeof b, 'object');
    test.equals(Object.getPrototypeOf(b), null);
    test.deepEqual(Object.keys(b), []);
    test.equals(b instanceof Object, false);

    test.done();
  },

  testIsJSON: function(test: nodeunit.Test) {
    test.throws(() => isJSON(5), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isJSON(null), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isJSON({}), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isJSON([]), 'Should throw -- Argument is neither string nor Buffer');
    test.ok(isJSON(JSON.stringify({ foobar: 5 })));
    test.ok(isJSON(JSON.stringify([1, 2, 3])));
    test.ok(!isJSON(JSON.stringify([1, 2, 3]) + '4'));
    test.ok(!isJSON('narwhals conveniently possess unmatched unicorn-like traits'));
    test.done();
  },

  testIsXML: function(test: nodeunit.Test) {
    test.throws(() => isXML(5), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isXML(null), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isXML({}), 'Should throw -- Argument is neither string nor Buffer');
    test.throws(() => isXML([]), 'Should throw -- Argument is neither string nor Buffer');
    test.ok(!isXML(JSON.stringify({ foobar: 5 })));
    test.ok(!isXML(JSON.stringify([1, 2, 3])));
    test.ok(!isXML('narwhals conveniently possess unmatched unicorn-like traits'));
    test.ok(!isXML('<'));
    test.ok(isXML('<>'));
    test.ok(isXML('</>'));
    let xml = '<superheroes><aquaman title="OMG">NODE VALUES</aquaman></superheroes>';
    test.ok(isXML(xml));
    test.done();
  },

  testIsObject: function(test: nodeunit.Test) {
    test.ok(isObject([]), 'isObject([]) === true');
    test.ok(isObject({}), 'isObject({}) === true');
    test.ok(!isObject('foo'), 'isObject(\'foo\') === false');
    test.ok(!isObject(100), 'isObject(100) === false');
    test.ok(!isObject(null), 'isObject(null) === false');
    test.ok(isObject(new BasicObject()), 'isObject(new BasicObject()) === true');

    test.done();
  },

  testToArray: function(test: nodeunit.Test) {
    let o = {};
    let ota = toArray(o);

    test.ok(Array.isArray(ota), 'toArray({}) returns an array');
    test.ok(ota.length === 1, 'toArray({}) returns an array of length 1');
    test.ok(ota[0] === o, 'toArray(objectX)[0] === objectX');
    test.ok(toArray(ota) === ota, 'toArray(arrayX) === arrayX');
    test.deepEqual(toArray(null), [null]);
    test.deepEqual(toArray(), []);
    test.deepEqual(toArray(undefined), []);

    test.done();
  },

  testDeepFreeze: function(test: nodeunit.Test) {
    let o = { a: { b: [{}] } };
    deepFreeze(o);
    test.ok(Object.isFrozen(o.a.b[0]));

    test.done();
  },

  testDup: function(test: nodeunit.Test) {
    let o = {5: 4, 3: 2, foobar: 'foobar', func: (function() { /**/ })};
    test.deepEqual(dup(o), {5: 4, 3: 2, foobar: 'foobar'});
    let p = new (function Test() {
      this.foo = 5;
      this.hey = 6;
    });
    test.deepEqual(dup(p), {foo: 5, hey: 6});
    test.done();
  },

  tearDown: function(callback) {
    callback();
  }
};
