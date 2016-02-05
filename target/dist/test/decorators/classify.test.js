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
var classify_1 = require('../../../src/utils/decorators/classify');
var ID_VAL = '271828';
var FIRST_NAME_VAL = 'Leonhard';
var LAST_NAME_VAL = 'Euler';
var FUNC_VAL = 'Gamma';
var clTarget;
var clFuncTarget;
module.exports = {
    setUp: function (callback) {
        clTarget = new ClassifyTarget();
        clFuncTarget = new ClassifyFuncTarget();
        callback();
    },
    testClassify: function (test) {
        test.equals(clTarget[classify_1.S_CLASSIFY], [ID_VAL, LAST_NAME_VAL].join(':'));
        test.equals(clFuncTarget[classify_1.S_CLASSIFY], [ID_VAL, LAST_NAME_VAL, FUNC_VAL].join(':'));
        test.done();
    },
    tearDown: function (callback) {
        callback();
    }
};
var ClassifyTarget = (function () {
    function ClassifyTarget() {
    }
    Object.defineProperty(ClassifyTarget.prototype, "id", {
        get: function () {
            return ID_VAL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassifyTarget.prototype, "first_name", {
        get: function () {
            return FIRST_NAME_VAL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassifyTarget.prototype, "last_name", {
        get: function () {
            return LAST_NAME_VAL;
        },
        enumerable: true,
        configurable: true
    });
    ClassifyTarget = __decorate([
        classify_1.classify('id', 'last_name')
    ], ClassifyTarget);
    return ClassifyTarget;
})();
var ClassifyFuncTarget = (function () {
    function ClassifyFuncTarget() {
    }
    Object.defineProperty(ClassifyFuncTarget.prototype, "id", {
        get: function () {
            return ID_VAL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassifyFuncTarget.prototype, "first_name", {
        get: function () {
            return FIRST_NAME_VAL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassifyFuncTarget.prototype, "last_name", {
        get: function () {
            return LAST_NAME_VAL;
        },
        enumerable: true,
        configurable: true
    });
    ClassifyFuncTarget.prototype.someFunc = function () {
        return FUNC_VAL;
    };
    ClassifyFuncTarget = __decorate([
        classify_1.classify('id', 'last_name', 'someFunc')
    ], ClassifyFuncTarget);
    return ClassifyFuncTarget;
})();
//# sourceMappingURL=classify.test.js.map