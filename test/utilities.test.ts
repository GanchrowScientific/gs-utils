/* Copyright © 2016-2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import { testWrapper, JasmineExpectation } from '../src/jasmineTestWrapper';

import { SimpleStore, BasicObject, isObject, isStrictObject, ensureObject, arraysEquivalent,
  toArray, deepFreeze, isJSON, isXML, dup, stripAnyValues, safeSetProperty,
  valuesAtCreate, isSameTypeOf, allArrayItemTypesMatch, CaseInsensitiveBucket,
  isNumeric, flattenArray, stringifyJSONNoEmptyArrays, hasAllPropertyValues,
  arrayIsSubset, multiArraySome, multiArrayEvery, arrayPartition, swapItems,
  leftDigit, convertArrayValuesToObject, deepEnsureObject, pickKeys, rejectKeys,
  isNumber, isString, isUndefined, isFunction, NOOP, shuffleArray } from '../src/utilities';

const MODULE = {
  setUp(callback) {
    callback();
  },

  testShuffleArray(test: JasmineExpectation) {
    let array = [1, 5, 23, 4, 56, 150, -1, 8, 'hey', 'ho'];
    test.notDeepEqual(shuffleArray(dup(array)), array);
    test.done();
  },

  testIs(test: JasmineExpectation) {
    test.ok(isNumber(5));
    test.ok(isNumber(-115));
    test.ok(isNumber(NaN));
    test.ok(!(['5', 'hey', NOOP, undefined, null, {}, []].every(isNumber)));
    test.ok(isString('hey'));
    test.ok(isString('123'));
    test.ok(isString(''));
    test.ok(!([5, NaN, NOOP, undefined, null, {}, []].every(isString)));
    test.ok(isUndefined(undefined));
    test.ok(!([5, NaN, NOOP, null, {}, [], 'hey', ''].every(isUndefined)));
    test.ok(isFunction(NOOP));
    test.ok(isFunction(isJSON));
    test.ok(isFunction(SimpleStore));
    test.ok(isFunction(deepFreeze));
    test.ok(![5, NaN, undefined, null, 'hey', {}, []].every(isFunction));
    test.done();
  },

  testPickKeys(test: JasmineExpectation) {
    let obj: any = {foo: 5, bar: 7, shabaz: 10};
    test.deepEqual(pickKeys(obj, 'foo', 'bar'), {foo: 5, bar: 7});
    test.deepEqual(obj, {foo: 5, bar: 7, shabaz: 10});
    obj = {foo: 5, bar: 7, shabaz: 10, deep: {hey: 9}};
    let pickedObj = pickKeys(obj, 'foo', 'deep');
    test.deepEqual(pickedObj, {foo: 5, deep: {hey: 9}});
    test.deepEqual(obj, {foo: 5, bar: 7, shabaz: 10, deep: {hey: 9}});

    // no reference
    pickedObj.foo = 1;
    test.strictEqual(obj.foo, 5);
    pickedObj.deep.hey = 21;
    test.strictEqual(obj.deep.hey, 9);
    test.done();
  },

  testRejectKeys(test: JasmineExpectation) {
    let obj: any = {foo: 5, bar: 7, shabaz: 10};
    test.deepEqual(rejectKeys(obj, 'foo', 'bar'), {foo: 5, bar: 7});
    test.deepEqual(obj, {shabaz: 10});
    obj = {foo: 5, bar: 7, shabaz: 10, deep: {hey: 9}};
    let pickedObj = rejectKeys(obj, 'foo', 'deep');
    test.deepEqual(pickedObj, {foo: 5, deep: {hey: 9}});
    test.deepEqual(obj, {bar: 7, shabaz: 10});
    test.done();
  },

  testDeepEnsureObject(test: JasmineExpectation) {
    let obj = {};
    test.deepEqual(deepEnsureObject(obj, ['foo', 'bar', 'baz', 'shabaz', '0']), {});
    test.deepEqual(obj, {
      foo: { bar: { baz: { shabaz: { 0: {} } } } }
    });
    obj = {};
    test.deepEqual(deepEnsureObject(obj, ['foo', 'bar', 'baz', 'shabaz', 0]), {});
    test.deepEqual(obj, {
      foo: { bar: { baz: { shabaz: { 0: {} } } } }
    });
    obj = {foo: 5};
    test.deepEqual(deepEnsureObject(obj, []), { foo: 5 });
    test.deepEqual(obj, { foo: 5 });
    test.done();
  },

  testConvertArrayValuesToObject(test: JasmineExpectation) {
    test.deepEqual(convertArrayValuesToObject({foobar: [1, 2, 3], baz: [4, 5, 6]}), [
      {
        foobar: 1,
        baz: 4
      }, {
        foobar: 2,
        baz: 5
      }, {
        foobar: 3,
        baz: 6
      }
    ]);
    test.deepEqual(convertArrayValuesToObject({foobar: 1, baz: [4, 5, 6]} as any), [
      {
        foobar: 1,
        baz: 4
      }, {
        baz: 5
      }, {
        baz: 6
      }
    ]);
    test.done();
  },

  testSwapItems(test: JasmineExpectation) {
    test.deepEqual(swapItems([1, 2, 3]), [2, 1, 3]);
    test.deepEqual(swapItems([{hey: 5}, {ho: 6}]), [{ho: 6}, {hey: 5}]);
    test.done();
  },

  testArrayPartition(test: JasmineExpectation) {
    test.deepEqual(arrayPartition([1, 2, 3, 4], () => true), [[1, 2, 3, 4], []]);
    test.deepEqual(arrayPartition([1, 2, 3, 4], () => false), [[], [1, 2, 3, 4]]);
    test.deepEqual(arrayPartition(
      ['cat', 'dog', 'catfish', 'dogfish'],
      (item) => /cat/.test(item)
    ), [['cat', 'catfish'], ['dog', 'dogfish']]);
    test.done();
  },

  testMultiArrayEvery(test: JasmineExpectation) {
    test.ok(multiArrayEvery([[1, 2, 3], [1, 3, 2]], 2));
    test.ok(multiArrayEvery([['foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 1));
    test.ok(!multiArrayEvery([['hey', 'how', 'are', 'you'], ['i', 'am', 'fine']], 'chimp'));
    test.ok(!multiArrayEvery([['', 'foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 2));
    test.ok(!multiArrayEvery([[6, 5, 8], [6, 5, 4]], (item) => item > 4));
    test.ok(multiArrayEvery([[6, 5, 8], [6, 5, 6]], (item) => item > 4));
    test.done();
  },

  testMultiArraySome(test: JasmineExpectation) {
    test.ok(multiArraySome([[1, 2, 3], [1, 3, 2]], 2));
    test.ok(multiArraySome([['foo', 'man', 'chu'], ['bob', 'mah', 'bubba']], 'man', 1));
    test.ok(!multiArraySome([['hey', 'how', 'are', 'you'], ['i', 'am', 'fine']], 'chimp'));
    test.ok(!multiArraySome([['foo', 'man', 'chu'], ['bob', 'man', 'bubba']], 'man', 2));
    test.ok(multiArraySome([[1, 2, 5], [1, 3, 2]], (item) => item > 4));
    test.done();
  },

  testIsStrictObject(test: JasmineExpectation) {
    test.ok(isStrictObject({}));
    test.ok(!isStrictObject([]));
    test.done();
  },

  testEnsureObject(test: JasmineExpectation) {
    let a = {foo: 5};
    let b = {foo: []};
    let c = {foo: {baz: 5}};
    test.deepEqual(ensureObject(a, 'foo'), {});
    test.deepEqual(ensureObject(b, 'foo'), {});
    test.deepEqual(ensureObject(c, 'foo'), {baz: 5});
    test.done();
  },

  testHasAllPropertyValues(test: JasmineExpectation) {
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

  testFlattenArray(test: JasmineExpectation) {
    test.deepEqual(flattenArray([1, 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], 2]), [1, 2]);
    test.deepEqual(flattenArray([[1], [2]]), [1, 2]);
    test.notDeepEqual(flattenArray([[[1]], [2]]), [1, 2]);
    test.done();
  },

  testStripAnyValues(test: JasmineExpectation) {
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

  testCaseInsensitiveBucket(test: JasmineExpectation) {
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

  testFetchSimpleStore(test: JasmineExpectation) {
    let ss = new SimpleStore();
    test.strictEqual(ss.fetch(5), 5);
    test.done();
  },

  testStoreReturnValueSimpleStore(test: JasmineExpectation) {
    let ss = new SimpleStore();
    test.strictEqual(ss.store(5, 7), 7);
    test.done();
  },

  testStoreAndFetchSimpleStore(test: JasmineExpectation) {
    let ss = new SimpleStore();
    test.strictEqual(ss.store(6, 3), ss.fetch(6));
    test.done();
  },

  testBasicObject(test: JasmineExpectation) {
    let b = new BasicObject();

    test.strictEqual(typeof b, 'object');
    test.strictEqual(Object.getPrototypeOf(b), null);
    test.deepEqual(Object.keys(b), []);
    test.strictEqual(b instanceof Object, false);

    test.done();
  },

  testIsJSON(test: JasmineExpectation) {
    test.throws(() => isJSON(5), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isJSON(null), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isJSON({}), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isJSON([]), new TypeError('Argument is neither string nor Buffer'));
    test.ok(isJSON(JSON.stringify({ foobar: 5 })));
    test.ok(isJSON(JSON.stringify([1, 2, 3])));
    test.ok(!isJSON(JSON.stringify([1, 2, 3]) + '4'));
    test.ok(!isJSON('narwhals conveniently possess unmatched unicorn-like traits'));
    test.ok(isJSON('false'));
    test.ok(isJSON('true'));
    test.ok(!isJSON('True'));
    test.ok(!isJSON('TRUE'));
    test.ok(!isJSON('FALSE'));
    test.ok(!isJSON('False'));
    test.ok(isJSON(Buffer.from('false')));
    test.ok(isJSON(Buffer.from('true')));
    test.ok(!isJSON(Buffer.from('True')));
    test.ok(!isJSON(Buffer.from('TRUE')));
    test.ok(!isJSON(Buffer.from('FALSE')));
    test.ok(!isJSON(Buffer.from('False')));
    test.done();
  },

  testIsXML(test: JasmineExpectation) {
    test.throws(() => isXML(5), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isXML(null), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isXML({}), new TypeError('Argument is neither string nor Buffer'));
    test.throws(() => isXML([]), new TypeError('Argument is neither string nor Buffer'));
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

  testIsObject(test: JasmineExpectation) {
    test.ok(isObject([]), 'isObject([]) === true');
    test.ok(isObject({}), 'isObject({}) === true');
    test.ok(!isObject('foo'), 'isObject(\'foo\') === false');
    test.ok(!isObject(100), 'isObject(100) === false');
    test.ok(!isObject(null), 'isObject(null) === false');
    test.ok(isObject(new BasicObject()), 'isObject(new BasicObject()) === true');

    test.done();
  },

  testToArray(test: JasmineExpectation) {
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

  testDeepFreeze(test: JasmineExpectation) {
    let o = { a: { b: [{}] } };
    deepFreeze(o);
    test.ok(Object.isFrozen(o.a.b[0]));

    test.done();
  },

  testDup(test: JasmineExpectation) {
    // let o = { 5: 4, 3: 2, foobar: 'foobar', func: (function () { /**/ }) };
    // test.deepEqual(dup(o), { 5: 4, 3: 2, foobar: 'foobar' });
    // let p = new (function Test() {
    //   this.foo = 5;
    //   this.hey = 6;
    // });
    // test.deepEqual(dup(p), { foo: 5, hey: 6 });

    // let x = { foobar: 5, shabaz: { 6: 5, foobar: 5 } };
    // test.deepEqual(dup(x, ['foobar']), { shabaz: { 6: 5 } });

    test.deepEqual(dup(Infinity), Infinity);
    test.deepEqual(dup({ val: Infinity }), { val: Infinity });
    test.deepEqual(dup([ Infinity ]), [ Infinity ]);
    test.deepEqual(dup(-Infinity), -Infinity);
    test.deepEqual(dup({ val: -Infinity }), { val: -Infinity });
    test.deepEqual(dup([ -Infinity ]), [ -Infinity ]);
    test.deepEqual(dup({ a: 5, b: 6 }, ['a']), { b: 6 });
    test.deepEqual(dup({ a: 5, b: 6 }, ['a', 'b']), { });
    test.deepEqual(dup({ a: 5, b: 6 }, ['a', 'b'], { b: 6 }), { b: 6 });
    test.deepEqual(dup({ a: 5, b: 6 }, ['a', 'b'], { a: 5 }), { a: 5 });
    test.deepEqual(dup({ a: 5, b: 6 }, ['a', 'b'], { a: 4 }), { });
    test.deepEqual(dup({ a: Infinity, b: 6 }, ['a', 'b'], { a: Infinity }), { a: Infinity });
    test.deepEqual(dup({ a: Infinity, b: 6 }, ['a', 'b'], { a: -Infinity }), { });
    test.deepEqual(dup({ a: -Infinity, b: 6 }, ['a', 'b'], { a: -Infinity }), { a: -Infinity });

    test.done();
  },

  testValuesAtCreate(test: JasmineExpectation) {
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

  testIsSameTypeOf(test: JasmineExpectation) {
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

  testAllArrayItemTypesMatch(test: JasmineExpectation) {
    test.ok(allArrayItemTypesMatch([0, 1, 2, 3]));
    test.ok(!allArrayItemTypesMatch([null, 0, 1]));
    test.ok(!allArrayItemTypesMatch([0, 'hey', null]));
    test.ok(allArrayItemTypesMatch(['foo', 'bar', 'shabaz']));
    /* tslint:disable:no-construct */
    test.ok(allArrayItemTypesMatch([new Number(), {}, [], null]));
    /* tslint:enable:no-construct */
    test.done();
  },

  testIsNumeric(test: JasmineExpectation) {
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

  testStringifyJSONNoEmptyArrays(test: JasmineExpectation) {
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

  testLeftDigits(test: JasmineExpectation) {
    test.strictEqual(leftDigit(7001, 2), 70);
    test.strictEqual(leftDigit(7001, 1), 7);
    test.strictEqual(leftDigit(95681, 4), 9568);
    test.strictEqual(leftDigit(95681), 9);
    test.strictEqual(leftDigit(95681, 5), 95681);
    test.strictEqual(leftDigit(95681, 6), 0);
    test.strictEqual(leftDigit(95681, 0), 0);
    test.strictEqual(leftDigit(1, 0), 0);
    test.strictEqual(leftDigit(1, -1), 0);
    test.strictEqual(leftDigit(1, 2), 0);
    test.done();
  },

  testArraysEquivalent(test: JasmineExpectation) {
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

  testArrayIsSubset(test: JasmineExpectation) {
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

  testSafeSetProperty(test: JasmineExpectation) {
    let obj = { };
    expect(safeSetProperty(obj, 123, 'a')).toBe(true);
    expect(obj).toEqual({ a: 123 });

    obj = { a: 456 };
    expect(safeSetProperty(obj, 123, 'a')).toBe(true);
    expect(obj).toEqual({ a: 123 });

    obj = { a: { b: {} } };
    expect(safeSetProperty(obj, 123, 'a', 'b')).toBe(true);
    expect(obj).toEqual({ a: { b: 123 } });

    obj = { a: { b: {} } };
    expect(safeSetProperty(obj, 123, 'a', 'b', 'c')).toBe(true);
    expect(obj).toEqual({ a: { b: { c: 123 } } });

    obj = { a: { } };
    expect(safeSetProperty(obj, 123, 'a', 'b', 'c')).toBe(false);
    expect(obj).toEqual({ a: {} });

    expect(() => safeSetProperty(null, 123, 'a', 'b', 'c')).toThrow(new Error('Must supply an object'));
    expect(() => safeSetProperty({}, 123)).toThrow(new Error('Must specify at least one field'));

    expect(() => safeSetProperty(undefined, 123, 'a', 'b', 'c')).toThrow(new Error('Must supply an object'));
    expect(() => safeSetProperty({}, 123)).toThrow(new Error('Must specify at least one field'));

    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

testWrapper.run(MODULE, expect, 'utilities');
