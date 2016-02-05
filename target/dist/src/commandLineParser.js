/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../typings/commander/commander.d.ts" />
var program = require('commander');
var gsLogger_1 = require('./gsLogger');
var configurationDirectoryLocator_1 = require('../configuration/configurationDirectoryLocator');
function process(args) {
    program
        .option('-c, --config-dir <dir>', 'Configuration directory')
        .option('-l, --log-level <level>', 'Default log level. One of: DEBUG, INFO, WARN, ERROR')
        .parse(args);
    var processedArgs = program;
    if (processedArgs.logLevel) {
        gsLogger_1.setGlobalLogLevel(processedArgs.logLevel);
    }
    if (processedArgs.configDir) {
        configurationDirectoryLocator_1.setGlobalConfigDir(processedArgs.configDir);
    }
    return processedArgs;
}
exports.process = process;
//# sourceMappingURL=commandLineParser.js.map