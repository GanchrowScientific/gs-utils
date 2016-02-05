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
var include_1 = require('../../../src/utils/decorators/include');
module.exports = {
    setUp: function (callback) {
        callback();
    },
    testBarInclude: function (test) {
        var bar = createBar();
        test.equals(bar.bar, 'bar');
        test.ok(!('foobar' in bar));
        test.equals(bar.shabaz, 5);
        test.equals(bar.shabazMethod(), 10);
        test.equals(bar.poofMethod(), 'poof up in the air');
        test.done();
    },
    testBarIncludeMethodOverride: function (test) {
        var bar = createBar();
        test.equals(bar.common(), 'COMMON');
        test.done();
    },
    testFoobarInclude: function (test) {
        var foobar = createFoobar();
        test.equals(foobar.foobar, 'foobar');
        test.equals(foobar.bar, 'bar');
        test.equals(foobar.shabaz, 5);
        test.equals(foobar.shabazMethod(), 10);
        test.equals(foobar.poofMethod(), 'poof up in the air');
        test.done();
    },
    testFoobarIncludeMethodOverride: function (test) {
        var foobar = createFoobar();
        test.equals(foobar.common(), 'COMMON');
        test.done();
    },
    tearDown: function (callback) {
        callback();
    }
};
function createBar() {
    return new Bar();
}
function createFoobar() {
    return new Foobar();
}
var Shabaz = (function () {
    function Shabaz() {
    }
    Object.defineProperty(Shabaz.prototype, "shabaz", {
        get: function () { return 5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shabaz.prototype, "common", {
        get: function () { return 5; },
        enumerable: true,
        configurable: true
    });
    Shabaz.prototype.shabazMethod = function () {
        return 10;
    };
    return Shabaz;
})();
var Poof = (function () {
    function Poof() {
    }
    Poof.prototype.poofMethod = function () {
        return 'poof up in the air';
    };
    Poof.prototype.common = function () {
        return 'COMMON';
    };
    return Poof;
})();
var Bar = (function () {
    function Bar() {
    }
    Object.defineProperty(Bar.prototype, "bar", {
        get: function () {
            return 'bar';
        },
        enumerable: true,
        configurable: true
    });
    Bar.prototype.shabazMethod = function () {
        /**/
    };
    Bar.prototype.poofMethod = function () {
        /**/
    };
    Bar = __decorate([
        include_1.include(Shabaz, Poof)
    ], Bar);
    return Bar;
})();
var Foobar = (function () {
    function Foobar() {
    }
    Object.defineProperty(Foobar.prototype, "foobar", {
        get: function () {
            return 'foobar';
        },
        enumerable: true,
        configurable: true
    });
    Foobar.prototype.common = function () {
        return 'ONCOMMON';
    };
    Foobar.prototype.shabazMethod = function () {
        /**/
    };
    Foobar.prototype.poofMethod = function () {
        /**/
    };
    Foobar = __decorate([
        include_1.include(Bar)
    ], Foobar);
    return Foobar;
})();
//# sourceMappingURL=include.test.js.map