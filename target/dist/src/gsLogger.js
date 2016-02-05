/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../typings/chalk/chalk.d.ts" />
var chalk = require('chalk');
exports.MSG_LEN_UNLIMITED = -1;
(function (Emphasis) {
    Emphasis[Emphasis["DEFAULT"] = 0] = "DEFAULT";
    Emphasis[Emphasis["NORMAL"] = 1] = "NORMAL";
    Emphasis[Emphasis["MEDIUM"] = 2] = "MEDIUM";
    Emphasis[Emphasis["STRONG"] = 3] = "STRONG";
    Emphasis[Emphasis["VERY_STRONG"] = 4] = "VERY_STRONG";
})(exports.Emphasis || (exports.Emphasis = {}));
var Emphasis = exports.Emphasis;
(function (Level) {
    Level[Level["DEBUG"] = 0] = "DEBUG";
    Level[Level["INFO"] = 1] = "INFO";
    Level[Level["WARN"] = 2] = "WARN";
    Level[Level["ERROR"] = 3] = "ERROR";
    Level[Level["NONE"] = 4] = "NONE";
})(exports.Level || (exports.Level = {}));
var Level = exports.Level;
function levelString() {
    return Object.keys(Level).filter(function (level) {
        return Number.isNaN(Number.parseInt(level, 10));
    }).join(', ');
}
var DEFAULT_LOG_LEVEL = Level.DEBUG;
var DEFAULT_MAX_DEBUG_MESSAGE_LENGTH = 64;
var globalLogLevel = DEFAULT_LOG_LEVEL;
function setGlobalLogLevel(logLevel) {
    var logLevelEnum;
    if (Level.hasOwnProperty(logLevel.toString())) {
        logLevelEnum = Number.isNaN(Number.parseInt(logLevel, 10)) ? Level[logLevel] : logLevel;
    }
    else {
        throw new Error("Invalid default log level " + logLevel + ".\nValid levels are " + levelString() + ".");
    }
    globalLogLevel = logLevelEnum;
}
exports.setGlobalLogLevel = setGlobalLogLevel;
function getLogger(label, logLevel, maxDebugMessageLength) {
    return new Logger(label, logLevel, maxDebugMessageLength);
}
exports.getLogger = getLogger;
var Logger = (function () {
    function Logger(label, logLevel, maxDebugMessageLength) {
        if (logLevel === void 0) { logLevel = Logger.defaultLogLevel; }
        if (maxDebugMessageLength === void 0) { maxDebugMessageLength = DEFAULT_MAX_DEBUG_MESSAGE_LENGTH; }
        this.label = label;
        this.logLevel = logLevel;
        this.maxDebugMessageLength = maxDebugMessageLength;
    }
    Logger.prototype.debug = function (message, options) {
        var emphasis;
        var maxLength;
        var logPrefix;
        if (typeof options === 'number') {
            emphasis = options;
        }
        else if (options) {
            emphasis = options.emphasis;
            maxLength = options.maxLength;
            logPrefix = options.logPrefix;
        }
        maxLength = typeof maxLength === 'number' ? maxLength : this.maxDebugMessageLength;
        this.logInternal(message, emphasis, Level.DEBUG, maxLength, logPrefix);
    };
    Logger.prototype.info = function (message, emphasis) {
        if (emphasis === void 0) { emphasis = Emphasis.NORMAL; }
        this.logInternal(message, emphasis, Level.INFO);
    };
    Logger.prototype.warn = function (message, emphasis) {
        if (emphasis === void 0) { emphasis = Emphasis.MEDIUM; }
        this.logInternal(message, emphasis, Level.WARN);
    };
    Logger.prototype.error = function (message, emphasis) {
        if (emphasis === void 0) { emphasis = Emphasis.STRONG; }
        this.logInternal(message, emphasis, Level.ERROR);
    };
    Logger.prototype.logInternal = function (message, emphasis, level, maxLength, logPrefix) {
        if (emphasis === void 0) { emphasis = Emphasis.DEFAULT; }
        if (maxLength === void 0) { maxLength = exports.MSG_LEN_UNLIMITED; }
        if (level >= this.getActualLogLevel()) {
            var stringMessage = this.stringify(message, maxLength);
            var fullMessage = this.generatePrefix(level, logPrefix) + stringMessage;
            var logMessage = this.colorMessage(fullMessage, emphasis);
            /* tslint:disable:no-console */
            console.log(logMessage);
        }
    };
    Logger.prototype.stringify = function (message, maxLength) {
        var stringMessage;
        switch (typeof message) {
            case 'object':
                if (message instanceof Error) {
                    stringMessage = message.message + "\n" + message.stack;
                }
                else {
                    stringMessage = JSON.stringify(message);
                }
                break;
            case 'undefined':
                stringMessage = 'undefined';
                break;
            default:
                stringMessage = message.toString();
                break;
        }
        return maxLength === exports.MSG_LEN_UNLIMITED ? stringMessage : stringMessage.substr(0, maxLength);
    };
    Logger.prototype.colorMessage = function (fullMessage, emphasis) {
        switch (emphasis) {
            case Emphasis.DEFAULT:
                return fullMessage;
            case Emphasis.NORMAL:
                return chalk.stripColor(fullMessage);
            case Emphasis.MEDIUM:
                return chalk.cyan(fullMessage).toString();
            case Emphasis.STRONG:
                return chalk.red(fullMessage).toString();
            case Emphasis.VERY_STRONG:
                return chalk.bgRed.black(fullMessage).toString();
        }
    };
    Logger.prototype.generatePrefix = function (level, logPrefix) {
        if (logPrefix === void 0) { logPrefix = ''; }
        logPrefix = logPrefix ? logPrefix + " " : '';
        return Level[level] + " [" + new Date().toISOString() + " #" + process.pid + "] " + this.label + " --- " + logPrefix;
    };
    Logger.prototype.getActualLogLevel = function () {
        return Math.max(globalLogLevel, this.logLevel);
    };
    Logger.defaultLogLevel = DEFAULT_LOG_LEVEL;
    return Logger;
})();
//# sourceMappingURL=gsLogger.js.map