/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
exports.S_CLASSIFY = Symbol('classify');
function classify() {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i - 0] = arguments[_i];
    }
    return function (ctor) {
        Object.defineProperty(ctor.prototype, exports.S_CLASSIFY, {
            get: function () {
                return keys.map(function (key) {
                    return typeof this[key] === 'function' ? this[key]() :
                        this[key].toString();
                }, this).join(':');
            }
        });
    };
}
exports.classify = classify;
//# sourceMappingURL=classify.js.map