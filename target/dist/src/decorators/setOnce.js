/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
function setOnce(target, propertyName, descriptor) {
    if (descriptor) {
        var defaultValue = descriptor.value;
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.set = function (value) {
            var newDescriptor = {
                configurable: descriptor.configurable,
                enumerable: descriptor.enumerable,
                value: value
            };
            Object.defineProperty(this, propertyName, newDescriptor);
        };
        descriptor.get = descriptor.get || function () { return defaultValue; };
    }
    else {
        Object.defineProperty(target, propertyName, {
            configurable: true,
            enumerable: true,
            set: function (value) {
                var newDescriptor = {
                    enumerable: true,
                    value: value
                };
                Object.defineProperty(this, propertyName, newDescriptor);
            }
        });
    }
}
exports.setOnce = setOnce;
//# sourceMappingURL=setOnce.js.map