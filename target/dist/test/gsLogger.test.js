/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>
/// <reference path="../../typings/sinon/sinon.d.ts"/>
/// <reference path="../typings/chalk/chalk.d.ts" />
// include this line to fix stack traces
require('source-map-support/register');
var sinon = require('sinon');
var chalk = require('chalk');
var gsLogger_1 = require('../../src/utils/gsLogger');
var mockConsole;
var originalISOString = Date.prototype.toISOString;
module.exports = {
    setUp: function (callback) {
        gsLogger_1.setGlobalLogLevel(gsLogger_1.Level.DEBUG);
        mockConsole = sinon.mock(console);
        Date.prototype.toISOString = function () {
            return 'NotADate';
        };
        callback();
    },
    testLogLevel: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.DEBUG);
        test.equal(logger.logLevel, gsLogger_1.Level.DEBUG);
        test.equal(logger.label, 'hucairz');
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- debug!");
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- info!");
        mockConsole.expects('log').withExactArgs("WARN [NotADate #" + process.pid + "] hucairz --- warn!");
        mockConsole.expects('log').withExactArgs("ERROR [NotADate #" + process.pid + "] hucairz --- error!");
        mockConsole.expects('log').withExactArgs("ERROR [NotADate #" + process.pid + "] hucairz --- error!");
        logger.info('info!', gsLogger_1.Emphasis.NORMAL);
        logger.debug('debug!', gsLogger_1.Emphasis.NORMAL);
        logger.warn('warn!', gsLogger_1.Emphasis.NORMAL);
        logger.error('error!', gsLogger_1.Emphasis.NORMAL);
        logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.ERROR);
        test.equal(logger.logLevel, gsLogger_1.Level.ERROR);
        logger.info('info!', gsLogger_1.Emphasis.NORMAL);
        logger.debug('debug!', gsLogger_1.Emphasis.NORMAL);
        logger.warn('warn!', gsLogger_1.Emphasis.NORMAL);
        logger.error('error!', gsLogger_1.Emphasis.NORMAL);
        mockConsole.verify();
        test.done();
    },
    testPrefix: function (test) {
        var logger = gsLogger_1.getLogger('hucairz');
        test.equal(logger.generatePrefix(gsLogger_1.Level.DEBUG), "DEBUG [NotADate #" + process.pid + "] hucairz --- ");
        logger = gsLogger_1.getLogger('other');
        test.equal(logger.generatePrefix(gsLogger_1.Level.DEBUG), "DEBUG [NotADate #" + process.pid + "] other --- ");
        mockConsole.verify();
        test.done();
    },
    testColorMessage: function (test) {
        var logger = gsLogger_1.getLogger('hucairz');
        test.equal(chalk.stripColor(logger.colorMessage('xxx', gsLogger_1.Emphasis.DEFAULT)), 'xxx');
        test.equal(chalk.stripColor(logger.colorMessage('xxx', gsLogger_1.Emphasis.NORMAL)), 'xxx');
        test.equal(chalk.stripColor(logger.colorMessage('xxx', gsLogger_1.Emphasis.MEDIUM)), 'xxx');
        test.equal(chalk.stripColor(logger.colorMessage('xxx', gsLogger_1.Emphasis.STRONG)), 'xxx');
        test.equal(chalk.stripColor(logger.colorMessage('xxx', gsLogger_1.Emphasis.VERY_STRONG)), 'xxx');
        test.done();
    },
    testNonString: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.DEBUG);
        var obj = generateObject();
        var maxDebugMessageLength = logger.maxDebugMessageLength;
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- " + JSON.stringify(obj));
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- " + JSON.stringify(obj).substr(0, maxDebugMessageLength));
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- 1");
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- undefined");
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- null");
        logger.info(obj, gsLogger_1.Emphasis.NORMAL);
        logger.debug(obj, gsLogger_1.Emphasis.NORMAL);
        logger.info(1, gsLogger_1.Emphasis.NORMAL);
        logger.info(undefined, gsLogger_1.Emphasis.NORMAL);
        logger.info(null, gsLogger_1.Emphasis.NORMAL);
        mockConsole.verify();
        test.done();
    },
    testMaxDebugMessageLength: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.DEBUG, 1);
        test.equal(logger.maxDebugMessageLength, 1);
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- X");
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- XXX");
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- XX");
        mockConsole.expects('log').withExactArgs("INFO [NotADate #" + process.pid + "] hucairz --- XXX");
        logger.debug('XXX');
        logger.info('XXX');
        logger.maxDebugMessageLength = 2;
        test.equal(logger.maxDebugMessageLength, 2);
        logger.debug('XXX');
        logger.info('XXX');
        mockConsole.verify();
        test.done();
    },
    testLoggerOptions: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.DEBUG);
        test.equal(logger.logLevel, gsLogger_1.Level.DEBUG);
        test.equal(logger.label, 'hucairz');
        var maxDebugMessageLength = logger.maxDebugMessageLength;
        var options = {
            logPrefix: '|logPrefix|',
            emphasis: gsLogger_1.Emphasis.NORMAL,
            maxLength: maxDebugMessageLength
        };
        var longObject = {
            foo: 'a long string to make on object whose string representation should exceed the default prefix length',
            bar: 'another nice long string to make sure'
        };
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- |logPrefix| debug with options");
        mockConsole.expects('log').withExactArgs(logger.colorMessage("DEBUG [NotADate #" + process.pid + "] hucairz --- |logPrefix| debug with options", gsLogger_1.Emphasis.VERY_STRONG));
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- |logPrefix| " + JSON.stringify(longObject).substr(0, maxDebugMessageLength));
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- |logPrefix| " + JSON.stringify(longObject));
        mockConsole.expects('log').withExactArgs("DEBUG [NotADate #" + process.pid + "] hucairz --- empty options");
        logger.debug('debug with options', options);
        options.emphasis = gsLogger_1.Emphasis.VERY_STRONG;
        logger.debug('debug with options', options);
        options.emphasis = gsLogger_1.Emphasis.NORMAL;
        logger.debug(longObject, options);
        options.maxLength = gsLogger_1.MSG_LEN_UNLIMITED;
        logger.debug(longObject, options);
        logger.debug('empty options', {});
        mockConsole.verify();
        test.done();
    },
    testStringify: function (test) {
        var logger = gsLogger_1.getLogger('hucairz');
        var e = new Error('message');
        var obj = { a: 123 };
        test.equals(logger.stringify(undefined), 'undefined');
        test.equals(logger.stringify(e), e.message + "\n" + e.stack);
        test.equals(logger.stringify('message'), 'message');
        test.equals(logger.stringify(1), '1');
        test.equals(logger.stringify(obj, 3), JSON.stringify(obj).substr(0, 3));
        test.equals(logger.stringify(obj, -1), JSON.stringify(obj));
        test.done();
    },
    testSetGlobalLogLevelEnum: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.WARN);
        mockConsole.expects('log').twice();
        gsLogger_1.setGlobalLogLevel(gsLogger_1.Level.WARN);
        logger.warn('hi');
        gsLogger_1.setGlobalLogLevel(gsLogger_1.Level.ERROR);
        logger.warn('hi');
        gsLogger_1.setGlobalLogLevel(gsLogger_1.Level.WARN);
        logger.warn('hi');
        mockConsole.verify();
        test.done();
    },
    testSetGlobalLogLevelString: function (test) {
        var logger = gsLogger_1.getLogger('hucairz', gsLogger_1.Level.WARN);
        mockConsole.expects('log').twice();
        gsLogger_1.setGlobalLogLevel('WARN');
        logger.warn('hi');
        gsLogger_1.setGlobalLogLevel('ERROR');
        logger.warn('hi');
        gsLogger_1.setGlobalLogLevel('WARN');
        logger.warn('hi');
        test.throws(function () { return gsLogger_1.setGlobalLogLevel('NOTALOGLEVEL'); }, Error, 'Invalid default log level NOTALOGLEVEL');
        test.throws(function () { return gsLogger_1.setGlobalLogLevel(false); }, Error, 'Invalid default log level false');
        mockConsole.verify();
        test.done();
    },
    tearDown: function (callback) {
        mockConsole.restore();
        Date.prototype.toISOString = originalISOString;
        callback();
    }
};
function generateObject() {
    var array = [];
    for (var i = 0; i < 100; i++) {
        array.push(i);
    }
    return array;
}
//# sourceMappingURL=gsLogger.test.js.map