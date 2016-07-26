/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import {SimpleStore, BasicObject, isObject,
  toArray, deepFreeze, isJSON, isXML, dup, stripAnyValues,
  valuesAtCreate, isSameTypeOf, allArrayItemTypesMatch, CaseInsensitiveBucket,
  isNumeric, flattenArray, stringifyJSONNoEmptyArrays} from '../src/utilities';

module.exports = {
  setUp: function (callback) {
    callback();
  },

  testFlattenArray(test: nodeunit.Test) {
    test.deepEqual(flattenArray([1, 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], [2]]), [1, 2]);
    test.notDeepEqual(flattenArray([[[1]], [2]]), [1, 2]);
    test.done();
  },

  testStripAnyValues(test: nodeunit.Test) {
    let obj = {hey: 'mental', foo: 'sigfigs', a: 'bored', _id: 4};
    test.deepEqual(stripAnyValues(obj, '_id'), {
      hey: 'mental', foo: 'sigfigs', a: 'bored'
    });
    test.deepEqual(stripAnyValues(obj, '_id', 'foo'), {
      hey: 'mental', a: 'bored'
    });
    test.deepEqual(stripAnyValues(obj, ['_id', 'foo']), obj);
    test.done();
  },

  testCaseInsensitiveBucket(test: nodeunit.Test) {
    let is = new CaseInsensitiveBucket('Hos', 'aKa');
    test.ok(is.has('hos'));
    test.ok(is.has('Hos'));
    test.ok(is.has('HoS'));
    test.ok(is.has('aka'));
    test.ok(is.has('aKa'));
    test.ok(is.has('AKA'));
    test.ok(!is.has('a'));
    test.done();
  },

  testFetchSimpleStore(test: nodeunit.Test) {
    let ss = new SimpleStore();
    test.equals(ss.fetch(5), 5);
    test.done();
  },

  testStoreReturnValueSimpleStore(test: nodeunit.Test) {
    let ss = new SimpleStore();
    test.equals(ss.store(5, 7), 7);
    test.done();
  },

  testStoreAndFetchSimpleStore(test: nodeunit.Test) {
    let ss = new SimpleStore();
    test.equals(ss.store(6, 3), ss.fetch(6));
    test.done();
  },

  testBasicObject: function (test: nodeunit.Test) {
    let b = new BasicObject();

    test.equals(typeof b, 'object');
    test.equals(Object.getPrototypeOf(b), null);
    test.deepEqual(Object.keys(b), []);
    test.equals(b instanceof Object, false);

    test.done();
  },

  testIsJSON: function (test: nodeunit.Test) {
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

  testIsXML: function (test: nodeunit.Test) {
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
    let xmlMultiLine = '<supervillains>\n  <villain name="Lex Luthor">1940</villain>\n' +
      '  <villain name="Harley Quinn">1992</villain>\n</supervillains>';
    test.ok(isXML(xmlMultiLine));
    test.done();
  },

  testIsObject: function (test: nodeunit.Test) {
    test.ok(isObject([]), 'isObject([]) === true');
    test.ok(isObject({}), 'isObject({}) === true');
    test.ok(!isObject('foo'), 'isObject(\'foo\') === false');
    test.ok(!isObject(100), 'isObject(100) === false');
    test.ok(!isObject(null), 'isObject(null) === false');
    test.ok(isObject(new BasicObject()), 'isObject(new BasicObject()) === true');

    test.done();
  },

  testToArray: function (test: nodeunit.Test) {
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

  testDeepFreeze: function (test: nodeunit.Test) {
    let o = { a: { b: [{}] } };
    deepFreeze(o);
    test.ok(Object.isFrozen(o.a.b[0]));

    test.done();
  },

  testDup: function (test: nodeunit.Test) {
    let o = { 5: 4, 3: 2, foobar: 'foobar', func: (function () { /**/ }) };
    test.deepEqual(dup(o), { 5: 4, 3: 2, foobar: 'foobar' });
    let p = new (function Test() {
      this.foo = 5;
      this.hey = 6;
    });
    test.deepEqual(dup(p), { foo: 5, hey: 6 });
    test.done();
  },

  testValuesAtCreate: function (test: nodeunit.Test) {
    let o = { 1: 2, 3: 34, 5: 6 };
    let emptyThunk = valuesAtCreate();
    let partialValuesThunk = valuesAtCreate(5, 6);
    let otherPartialValuesThunk = valuesAtCreate(1, 2);
    let allValuesThunk = valuesAtCreate(1, 3, 5);
    let noValuesThunk = valuesAtCreate(7, 8, 9);

    test.equals(typeof emptyThunk, 'function');
    test.ok(Array.isArray(emptyThunk(o)));

    test.deepEqual(noValuesThunk(o), [undefined, undefined, undefined]);
    test.deepEqual(allValuesThunk(o), [2, 34, 6]);
    test.deepEqual(partialValuesThunk(o), [6, undefined]);
    test.deepEqual(otherPartialValuesThunk(o), [2, undefined]);

    test.equals(emptyThunk(o).length, 0);

    test.done();
  },

  testIsSameTypeOf: function (test: nodeunit.Test) {
    let undefinedType = isSameTypeOf(undefined);
    let objectType = isSameTypeOf({});
    let numberType = isSameTypeOf(1);
    /* tslint:disable:no-empty */
    let funcType = isSameTypeOf(() => { });
    /* tslint:enable:no-empty */
    let strType = isSameTypeOf('foobar');
    test.ok(undefinedType(undefined));
    test.ok(!undefinedType(null));
    test.ok(objectType({}));
    test.ok(objectType([]));
    test.ok(objectType(null));
    test.ok(!objectType(5));
    test.ok(!objectType('foo'));
    test.ok(numberType(0));
    test.ok(numberType(NaN));
    test.ok(!numberType('foo'));
    test.ok(funcType((b) => b));
    test.ok(!funcType('foo'));
    test.ok(!funcType({}));
    test.ok(strType('the horse jumps higher than the elephant'));
    test.ok(!strType(undefined));
    test.ok(!strType(5));
    test.done();
  },

  testAllArrayItemTypesMatch: function (test: nodeunit.Test) {
    test.ok(allArrayItemTypesMatch([0, 1, 2, 3]));
    test.ok(!allArrayItemTypesMatch([null, 0, 1]));
    test.ok(!allArrayItemTypesMatch([0, 'hey', null]));
    test.ok(allArrayItemTypesMatch(['foo', 'bar', 'shabaz']));
    /* tslint:disable:no-construct */
    test.ok(allArrayItemTypesMatch([new Number(), {}, [], null]));
    /* tslint:enable:no-construct */
    test.done();
  },

  testIsNumeric: function (test: nodeunit.Test) {
    test.ok(isNumeric(4));
    test.ok(isNumeric(0));
    test.ok(isNumeric(-6));
    test.ok(isNumeric('3'));
    test.ok(isNumeric('0'));
    test.ok(isNumeric('+5'));
    test.ok(!isNumeric(true));
    test.ok(!isNumeric(false));
    test.ok(isNumeric(0x35));
    test.ok(isNumeric(Infinity));
    test.ok(!isNumeric(''));
    test.ok(!isNumeric('x'));
    test.ok(isNumeric('0x35'));
    test.ok(!isNumeric([]));
    test.ok(!isNumeric(undefined));
    test.ok(!isNumeric(null));
    test.ok(!isNumeric(NaN));
    test.ok(!isNumeric({}));
    test.ok(!isNumeric([5]));
    test.ok(!isNumeric([5, 5]));
    test.done();
  },

  testStringifyJSONNoEmptyArrays: function(test: nodeunit.Test) {
    let emptyArray = [];
    let objWithEmptyArrayValue = { a: emptyArray, b: [null], c: {} };
    let objWithNoEmptyArrayValue = dup(objWithEmptyArrayValue);
    delete objWithNoEmptyArrayValue.a;

    test.equals(stringifyJSONNoEmptyArrays(emptyArray), undefined);
    test.equals(stringifyJSONNoEmptyArrays(objWithNoEmptyArrayValue), JSON.stringify(objWithNoEmptyArrayValue));
    test.equals(stringifyJSONNoEmptyArrays(objWithEmptyArrayValue), JSON.stringify(objWithNoEmptyArrayValue));
    test.done();
  },

  tearDown: function (callback) {
    callback();
  }
};
