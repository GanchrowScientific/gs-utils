/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>
// include this line to fix stack traces
require('source-map-support/register');
var chunker_1 = require('../../src/utils/chunker');
module.exports = {
    testChunker: function (test) {
        var c = new chunker_1.Chunker();
        var a = [];
        var f = function (x) {
            a.push(x);
        };
        c.forEachCompleteChunk('1\n2', f);
        c.forEachCompleteChunk('3\n4\n', f);
        c.forEachCompleteChunk('5', f);
        c.forEachCompleteChunk('6', f);
        c.forEachCompleteChunk('\n', f);
        c.forEachCompleteChunk('7\n', f);
        c.forEachCompleteChunk('\n', f);
        test.equals(a.toString(), ['1', '23', '4', '56', '7', ''].toString());
        test.done();
    }
};
//# sourceMappingURL=chunker.test.js.map