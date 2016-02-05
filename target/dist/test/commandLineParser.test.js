/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>
// include this line to fix stack traces
require('source-map-support/register');
var sinon = require('sinon');
var pq = require('proxyquire');
var program = require('commander');
var proxyquire = pq.noPreserveCache();
var spies;
var commandLineParser;
module.exports = {
    setUp: function (callback) {
        commandLineParser = createMocks();
        callback();
    },
    testProcessConfigDir: function (test) {
        var processed = commandLineParser.process(['a', 'b', '-c', 'my-dir']);
        test.equals(processed.configDir, 'my-dir');
        test.ok(spies.setGlobalConfigDirSpy.calledOnce, 'Should have set the config dir');
        test.ok(spies.setGlobalLogLevelSpy.notCalled, 'Should not have set the log level');
        test.done();
    },
    testProcessLogLevel: function (test) {
        var processed = commandLineParser.process(['a', 'b', '-l', 'WARN']);
        test.equals(processed.logLevel, 'WARN');
        test.ok(spies.setGlobalLogLevelSpy.calledOnce, 'Should have set the log level');
        test.ok(spies.setGlobalConfigDirSpy.notCalled, 'Should not have set the config dir');
        test.done();
    },
    tearDown: function (callback) {
        // grrrrr...parsed args stick around on the program object.
        // must remove them here.
        delete program.configDir;
        delete program.logLevel;
        callback();
    }
};
function createMocks() {
    spies = {
        setGlobalLogLevelSpy: sinon.spy(),
        setGlobalConfigDirSpy: sinon.spy()
    };
    return proxyquire('../../src/utils/commandLineParser', {
        './gsLogger': {
            setGlobalLogLevel: spies.setGlobalLogLevelSpy
        },
        '../configuration/configurationDirectoryLocator': {
            setGlobalConfigDir: spies.setGlobalConfigDirSpy
        }
    });
}
//# sourceMappingURL=commandLineParser.test.js.map