/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
function include() {
    var baseCtors = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        baseCtors[_i - 0] = arguments[_i];
    }
    return function (target) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                target.prototype[name] = baseCtor.prototype[name];
            });
        });
    };
}
exports.include = include;
//# sourceMappingURL=include.js.map