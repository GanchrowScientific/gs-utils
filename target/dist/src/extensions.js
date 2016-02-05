/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/node/node.d.ts"/>
Object.defineProperties(Array.prototype, {
    compact: {
        value: function () {
            return this.filter(function (item) { return item !== undefined; });
        }
    }
});
Object.defineProperties(Object, {
    values: {
        value: function (obj) {
            return Object.keys(obj).map(function (k) { return obj[k]; });
        },
        configurable: true
    }
});
//# sourceMappingURL=extensions.js.map