/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
exports.isJSON = Object.defineProperties(function (str) {
    if (typeof str === 'string') {
        return (exports.isJSON.BEGIN_OBJECT_JSON.test(str) && exports.isJSON.END_OBJECT_JSON.test(str)) ||
            (exports.isJSON.BEGIN_ARRAY_JSON.test(str) && exports.isJSON.END_ARRAY_JSON.test(str));
    }
    else if (typeof str === 'buffer') {
        return (str[0] === exports.isJSON.BUFFER_BEGIN_OBJECT_JSON && str[str.length - 1] === exports.isJSON.BUFFER_END_OBJECT_JSON) ||
            (str[0] === exports.isJSON.BUFFER_BEGIN_ARRAY_JSON && str[str.length - 1] === exports.isJSON.BUFFER_END_ARRAY_JSON);
    }
    throw new TypeError('Argument is neither string nor Buffer');
}, {
    BEGIN_OBJECT_JSON: { value: /^\{/ },
    END_OBJECT_JSON: { value: /\}$/ },
    BEGIN_ARRAY_JSON: { value: /^\[/ },
    END_ARRAY_JSON: { value: /\]$/ },
    BUFFER_BEGIN_OBJECT_JSON: { value: '{'.codePointAt(0) },
    BUFFER_END_OBJECT_JSON: { value: '}'.codePointAt(0) },
    BUFFER_BEGIN_ARRAY_JSON: { value: '['.codePointAt(0) },
    BUFFER_END_ARRAY_JSON: { value: ']'.codePointAt(0) }
});
exports.isXML = Object.defineProperties(function (str) {
    if (typeof str === 'string') {
        return exports.isXML.XML_REGEXP.test(str);
    }
    else if (typeof str === 'buffer') {
        return (str[0] === exports.isXML.BUFFER_BEGIN_XML) && (str[str.length - 1] === exports.isXML.BUFFER_END_XML);
    }
    throw new TypeError('Argument is neither string nor Buffer');
}, {
    XML_REGEXP: { value: /^<.*>$/ },
    BUFFER_BEGIN_XML: { value: '<'.codePointAt(0) },
    BUFFER_END_XML: { value: '>'.codePointAt(0) }
});
var BasicObject = (function (_super) {
    __extends(BasicObject, _super);
    function BasicObject() {
        return Object.create(null);
    }
    return BasicObject;
})(null);
exports.BasicObject = BasicObject;
function toArray(obj) {
    return Array.isArray(obj) ? obj : obj === undefined ? [] : [obj];
}
exports.toArray = toArray;
function isObject(obj) {
    return obj != null && typeof obj === 'object';
}
exports.isObject = isObject;
function deepFreeze(obj) {
    if (isObject(obj) || typeof obj === 'function') {
        Object.freeze(obj);
        Object.keys(obj).forEach(function (key) {
            deepFreeze(obj[key]);
        });
    }
    return obj;
}
exports.deepFreeze = deepFreeze;
function dup(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.dup = dup;
//# sourceMappingURL=utilities.js.map