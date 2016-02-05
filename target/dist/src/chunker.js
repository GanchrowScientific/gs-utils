/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
var Chunker = (function () {
    function Chunker(split) {
        this.partial = '';
        this.split = split || Chunker.LINEFEED;
    }
    Chunker.prototype.forEachCompleteChunk = function (dataBuf, cb) {
        var data = dataBuf.toString('utf8').split(this.split);
        var lastIdx = data.length - 1;
        this.partial += data[0];
        for (var i = 0; i < lastIdx; i++) {
            cb(this.partial);
            this.partial = data[i + 1];
        }
    };
    Chunker.LINEFEED = '\n';
    return Chunker;
})();
exports.Chunker = Chunker;
//# sourceMappingURL=chunker.js.map