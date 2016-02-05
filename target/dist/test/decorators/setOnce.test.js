/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>
// include this line in all test files to fix stack traces
require('source-map-support/register');
var setOnce_1 = require('../../../src/utils/decorators/setOnce');
var NO_VALUE_SET_ERROR = new Error('No value set!');
var SOME_VALUE = 'Norton';
var SOME_OTHER_VALUE = 'Philosopher';
var c;
var cc;
module.exports = {
    setUp: function (callback) {
        c = generateTestClassInstance();
        cc = generateTestClassInstance();
        callback();
    },
    testSetOnceProperty: function (test) {
        test.equal(c.setOnceProperty, undefined);
        test.equal(cc.setOnceProperty, undefined);
        c.setOnceProperty = SOME_VALUE;
        test.equal(c.setOnceProperty, SOME_VALUE);
        test.equal(cc.setOnceProperty, undefined);
        test.throws(function () { c.setOnceProperty = SOME_OTHER_VALUE; });
        test.equal(c.setOnceProperty, SOME_VALUE);
        test.equal(cc.setOnceProperty, undefined);
        cc.setOnceProperty = SOME_OTHER_VALUE;
        test.equal(c.setOnceProperty, SOME_VALUE);
        test.equal(cc.setOnceProperty, SOME_OTHER_VALUE);
        test.done();
    },
    testSetOncePropertyPredefined: function (test) {
        test.equal(c.setOncePropertyPredefined, SOME_VALUE);
        test.equal(cc.setOncePropertyPredefined, SOME_VALUE);
        test.throws(function () { c.setOncePropertyPredefined = SOME_OTHER_VALUE; });
        test.equal(c.setOncePropertyPredefined, SOME_VALUE);
        test.equal(cc.setOncePropertyPredefined, SOME_VALUE);
        test.done();
    },
    testSetOnceAccessor: function (test) {
        test.equal(c.setOnceAccessor, undefined);
        test.equal(cc.setOnceAccessor, undefined);
        c.setOnceAccessor = SOME_VALUE;
        test.equal(c.setOnceAccessor, SOME_VALUE);
        test.equal(cc.setOnceAccessor, undefined);
        test.throws(function () { c.setOnceAccessor = SOME_OTHER_VALUE; });
        test.equal(c.setOnceAccessor, SOME_VALUE);
        test.equal(cc.setOnceAccessor, undefined);
        cc.setOnceAccessor = SOME_OTHER_VALUE;
        test.equal(c.setOnceAccessor, SOME_VALUE);
        test.equal(cc.setOnceAccessor, SOME_OTHER_VALUE);
        test.done();
    },
    testSetOnceAccessorWithGet: function (test) {
        test.throws(function () {
            return c.setOnceAccessorWithGet === SOME_OTHER_VALUE;
        }, Error, NO_VALUE_SET_ERROR.message);
        c.setOnceAccessorWithGet = SOME_VALUE;
        test.equal(c.setOnceAccessorWithGet, SOME_VALUE);
        test.throws(function () {
            return cc.setOnceAccessorWithGet === SOME_OTHER_VALUE;
        }, Error, NO_VALUE_SET_ERROR.message);
        test.throws(function () { c.setOnceAccessorWithGet = SOME_OTHER_VALUE; });
        test.equal(c.setOnceAccessorWithGet, SOME_VALUE);
        test.throws(function () {
            return cc.setOnceAccessorWithGet === SOME_OTHER_VALUE;
        }, Error, NO_VALUE_SET_ERROR.message);
        cc.setOnceAccessorWithGet = SOME_OTHER_VALUE;
        test.equal(c.setOnceAccessorWithGet, SOME_VALUE);
        test.equal(cc.setOnceAccessorWithGet, SOME_OTHER_VALUE);
        test.done();
    },
    tearDown: function (callback) {
        callback();
    }
};
var C = (function () {
    function C() {
        this.setOncePropertyPredefined = SOME_VALUE;
    }
    Object.defineProperty(C.prototype, "setOnceAccessor", {
        set: function (val) { },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(C.prototype, "setOnceAccessorWithGet", {
        get: function () { throw NO_VALUE_SET_ERROR; },
        enumerable: true,
        configurable: true
    });
    ;
    __decorate([
        setOnce_1.setOnce
    ], C.prototype, "setOnceProperty", void 0);
    __decorate([
        setOnce_1.setOnce
    ], C.prototype, "setOncePropertyPredefined", void 0);
    __decorate([
        setOnce_1.setOnce
    ], C.prototype, "setOnceAccessor", null);
    __decorate([
        setOnce_1.setOnce
    ], C.prototype, "setOnceAccessorWithGet", null);
    return C;
})();
function generateTestClassInstance() {
    return new C();
}
//# sourceMappingURL=setOnce.test.js.map