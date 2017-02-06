/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';

import {SimpleStore, BasicObject, isObject, isStrictObject, ensureObject, arraysEquivalent,
  toArray, deepFreeze, isJSON, isXML, dup, stripAnyValues,
  valuesAtCreate, isSameTypeOf, allArrayItemTypesMatch, CaseInsensitiveBucket,
  isNumeric, flattenArray, stringifyJSONNoEmptyArrays, hasAllPropertyValues,
  arrayIsSubset, multiArraySome, multiArrayEvery} from '../src/utilities';

module.exports = {
  setUp: function (callback) {
    callback();
  },

  testMultiArrayEvery(test: nodeunit.Test) {
    test.ok(multiArrayEvery([[1, 2, 3], [1, 3, 2]], 2));
    test.ok(multiArrayEvery([['foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 1));
    test.ok(!multiArrayEvery([['hey', 'how', 'are', 'you'], ['i', 'am', 'fine']], 'chimp'));
    test.ok(!multiArrayEvery([['', 'foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 2));
    test.ok(!multiArrayEvery([[6, 5, 8], [6, 5, 4]], (item) => item > 4));
    test.ok(multiArrayEvery([[6, 5, 8], [6, 5, 6]], (item) => item > 4));
    test.done();
  },

  testMultiArraySome(test: nodeunit.Test) {
    test.ok(multiArraySome([[1, 2, 3], [1, 3, 2]], 2));
    test.ok(multiArraySome([['foo', 'man', 'chu'], ['bob', 'mah', 'bubba']], 'man', 1));
    test.ok(!multiArraySome([['hey', 'how', 'are', 'you'], ['i', 'am', 'fine']], 'chimp'));
    test.ok(!multiArraySome([['foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 2));
    test.ok(multiArraySome([[1, 2, 5], [1, 3, 2]], (item) => item > 4));
    test.done();
  },

  testIsStrictObject(test: nodeunit.Test) {
    test.ok(isStrictObject({}));
    test.ok(!isStrictObject([]));
    test.done();
  },

  testEnsureObject(test: nodeunit.Test) {
    let a = {foo: 5};
    let b = {foo: []};
    let c = {foo: {baz: 5}};
    test.deepEqual(ensureObject(a, 'foo'), {});
    test.deepEqual(ensureObject(b, 'foo'), {});
    test.deepEqual(ensureObject(c, 'foo'), {baz: 5});
    test.done();
  },

  testHasAllPropertyValues(test: nodeunit.Test) {
    test.ok(hasAllPropertyValues({ foo: 5, bar: 6 }, { foo: 5, bar: 6, baz: 7 }));
    test.ok(!hasAllPropertyValues({ foo: 5, bar: 6 }, { foo: 5, bar: 7, baz: 7 }));
    test.ok(hasAllPropertyValues([1, 2, 3], [1, 2, 3, 4]));
    test.ok(!hasAllPropertyValues([1, 2, 3, 4], [1, 2, 3]));
    test.ok(hasAllPropertyValues({
      foo: {
        bar: 6,
        shabaz: {
          hey: 7
        }
      },
      ho: 5
    }, {
        foo: {
          bar: 6,
          shabaz: {
            hey: 7,
            foo: 54
          }
        },
        baz: 4,
        ho: 5,
        hey: 6
      }));
    test.ok(!hasAllPropertyValues({
      foo: {
        bar: 6,
        shabaz: {
          hey: 6
        }
      },
      ho: 5
    }, {
        foo: {
          bar: 6,
          shabaz: {
            hey: 7,
            foo: 54
          }
        },
        baz: 4,
        ho: 5,
        hey: 6
      }));
    test.done();
  },

  testFlattenArray(test: nodeunit.Test) {
    test.deepEqual(flattenArray([1, 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], [2]]), [1, 2]);
    test.notDeepEqual(flattenArray([[[1]], [2]]), [1, 2]);
    test.done();
  },

  testStripAnyValues(test: nodeunit.Test) {
    let obj = { hey: 'mental', foo: 'sigfigs', a: 'bored', _id: 4 };
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
    test.strictEqual(ss.fetch(5), 5);
    test.done();
  },

  testStoreReturnValueSimpleStore(test: nodeunit.Test) {
    let ss = new SimpleStore();
    test.strictEqual(ss.store(5, 7), 7);
    test.done();
  },

  testStoreAndFetchSimpleStore(test: nodeunit.Test) {
    let ss = new SimpleStore();
    test.strictEqual(ss.store(6, 3), ss.fetch(6));
    test.done();
  },

  testBasicObject: function (test: nodeunit.Test) {
    let b = new BasicObject();

    test.strictEqual(typeof b, 'object');
    test.strictEqual(Object.getPrototypeOf(b), null);
    test.deepEqual(Object.keys(b), []);
    test.strictEqual(b instanceof Object, false);

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

    let x = { foobar: 5, shabaz: { 6: 5, foobar: 5 } };
    test.deepEqual(dup(x, ['foobar']), { shabaz: { 6: 5 } });
    test.done();
  },

  testValuesAtCreate: function (test: nodeunit.Test) {
    let o = { 1: 2, 3: 34, 5: 6 };
    let emptyThunk = valuesAtCreate();
    let partialValuesThunk = valuesAtCreate(5, 6);
    let otherPartialValuesThunk = valuesAtCreate(1, 2);
    let allValuesThunk = valuesAtCreate(1, 3, 5);
    let noValuesThunk = valuesAtCreate(7, 8, 9);

    test.strictEqual(typeof emptyThunk, 'function');
    test.ok(Array.isArray(emptyThunk(o)));

    test.deepEqual(noValuesThunk(o), [undefined, undefined, undefined]);
    test.deepEqual(allValuesThunk(o), [2, 34, 6]);
    test.deepEqual(partialValuesThunk(o), [6, undefined]);
    test.deepEqual(otherPartialValuesThunk(o), [2, undefined]);

    test.strictEqual(emptyThunk(o).length, 0);

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

  testStringifyJSONNoEmptyArrays: function (test: nodeunit.Test) {
    let emptyArray = [];
    let arrayOfEmptyArrays = [emptyArray, emptyArray];
    let arrayOfUndefineds = [undefined, undefined];
    let objWithEmptyArrayValue = { a: emptyArray, b: [null], c: {} };
    let objWithNoEmptyArrayValue = dup(objWithEmptyArrayValue);
    delete objWithNoEmptyArrayValue.a;

    test.strictEqual(stringifyJSONNoEmptyArrays(emptyArray), undefined);
    test.strictEqual(stringifyJSONNoEmptyArrays(objWithNoEmptyArrayValue), JSON.stringify(objWithNoEmptyArrayValue));
    test.strictEqual(stringifyJSONNoEmptyArrays(objWithEmptyArrayValue), JSON.stringify(objWithNoEmptyArrayValue));
    test.strictEqual(stringifyJSONNoEmptyArrays(arrayOfEmptyArrays), JSON.stringify(arrayOfUndefineds));
    test.done();
  },

  testArraysEquivalent(test: nodeunit.Test) {
    let val1 = {};
    let val2 = {};

    test.ok(arraysEquivalent(null, null));
    test.ok(arraysEquivalent(null, []));
    test.ok(arraysEquivalent([], null));
    test.ok(arraysEquivalent([], []));
    test.ok(arraysEquivalent([1], [1]));
    test.ok(arraysEquivalent([1, 2], [2, 1]));
    test.ok(arraysEquivalent([val1, val2], [val2, val1]));

    test.ok(!arraysEquivalent([1], []));
    test.ok(!arraysEquivalent([1], null));
    test.ok(!arraysEquivalent([1], [1, 2, 3]));
    test.ok(!arraysEquivalent([val1, val2], [{}, {}]));

    test.done();
  },

  testArrayIsSubset(test: nodeunit.Test) {
    test.ok(arrayIsSubset(null, null));
    test.ok(arrayIsSubset([], null));
    test.ok(arrayIsSubset(null, []));
    test.ok(arrayIsSubset([], []));
    test.ok(arrayIsSubset(undefined, undefined));
    test.ok(arrayIsSubset([], undefined));
    test.ok(arrayIsSubset(undefined, []));
    test.ok(arrayIsSubset(undefined, [1, 2, 3]));
    test.ok(arrayIsSubset([], [1, 2]));
    test.ok(arrayIsSubset([1, 2], [1, 2, 3]));
    test.ok(arrayIsSubset([2, 3, 5], [3, 5, 2]));
    test.ok(!arrayIsSubset([1, 2, 3], [1, 2]));
    test.done();
  },

  tearDown: function (callback) {
    callback();
  }
};
