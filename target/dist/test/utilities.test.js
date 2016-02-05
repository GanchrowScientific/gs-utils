/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>
// include this line to fix stack traces
require('source-map-support/register');
var utilities_1 = require('../../src/utils/utilities');
module.exports = {
    setUp: function (callback) {
        callback();
    },
    testBasicObject: function (test) {
        var b = new utilities_1.BasicObject();
        test.equals(typeof b, 'object');
        test.equals(Object.getPrototypeOf(b), null);
        test.deepEqual(Object.keys(b), []);
        test.equals(b instanceof Object, false);
        test.done();
    },
    testIsJSON: function (test) {
        test.throws(function () { return utilities_1.isJSON(5); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isJSON(null); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isJSON({}); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isJSON([]); }, 'Should throw -- Argument is neither string nor Buffer');
        test.ok(utilities_1.isJSON(JSON.stringify({ foobar: 5 })));
        test.ok(utilities_1.isJSON(JSON.stringify([1, 2, 3])));
        test.ok(!utilities_1.isJSON(JSON.stringify([1, 2, 3]) + '4'));
        test.ok(!utilities_1.isJSON('narwhals conveniently possess unmatched unicorn-like traits'));
        test.done();
    },
    testIsXML: function (test) {
        test.throws(function () { return utilities_1.isXML(5); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isXML(null); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isXML({}); }, 'Should throw -- Argument is neither string nor Buffer');
        test.throws(function () { return utilities_1.isXML([]); }, 'Should throw -- Argument is neither string nor Buffer');
        test.ok(!utilities_1.isXML(JSON.stringify({ foobar: 5 })));
        test.ok(!utilities_1.isXML(JSON.stringify([1, 2, 3])));
        test.ok(!utilities_1.isXML('narwhals conveniently possess unmatched unicorn-like traits'));
        test.ok(!utilities_1.isXML('<'));
        test.ok(utilities_1.isXML('<>'));
        test.ok(utilities_1.isXML('</>'));
        var xml = '<superheroes><aquaman title="OMG">NODE VALUES</aquaman></superheroes>';
        test.ok(utilities_1.isXML(xml));
        test.done();
    },
    testIsObject: function (test) {
        test.ok(utilities_1.isObject([]), 'isObject([]) === true');
        test.ok(utilities_1.isObject({}), 'isObject({}) === true');
        test.ok(!utilities_1.isObject('foo'), 'isObject(\'foo\') === false');
        test.ok(!utilities_1.isObject(100), 'isObject(100) === false');
        test.ok(!utilities_1.isObject(null), 'isObject(null) === false');
        test.ok(utilities_1.isObject(new utilities_1.BasicObject()), 'isObject(new BasicObject()) === true');
        test.done();
    },
    testToArray: function (test) {
        var o = {};
        var ota = utilities_1.toArray(o);
        test.ok(Array.isArray(ota), 'toArray({}) returns an array');
        test.ok(ota.length === 1, 'toArray({}) returns an array of length 1');
        test.ok(ota[0] === o, 'toArray(objectX)[0] === objectX');
        test.ok(utilities_1.toArray(ota) === ota, 'toArray(arrayX) === arrayX');
        test.deepEqual(utilities_1.toArray(null), [null]);
        test.deepEqual(utilities_1.toArray(), []);
        test.deepEqual(utilities_1.toArray(undefined), []);
        test.done();
    },
    testDeepFreeze: function (test) {
        var o = { a: { b: [{}] } };
        utilities_1.deepFreeze(o);
        test.ok(Object.isFrozen(o.a.b[0]));
        test.done();
    },
    testDup: function (test) {
        var o = { 5: 4, 3: 2, foobar: 'foobar', func: (function () { }) };
        test.deepEqual(utilities_1.dup(o), { 5: 4, 3: 2, foobar: 'foobar' });
        var p = new (function Test() {
            this.foo = 5;
            this.hey = 6;
        });
        test.deepEqual(utilities_1.dup(p), { foo: 5, hey: 6 });
        test.done();
    },
    tearDown: function (callback) {
        callback();
    }
};
//# sourceMappingURL=utilities.test.js.map