/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import * as pq from 'proxyquire';
import * as nodeunit from 'nodeunit';
import * as chalk from 'chalk';

import {getLogger, Level, Emphasis, LoggerOptions, MSG_LEN_UNLIMITED, setGlobalLogLevel}
from '../src/gsLogger';

let proxyquire = pq.noPreserveCache();
let mockConsole: sinon.SinonMock;
let originalISOString = Date.prototype.toISOString;
let createTransportSpy: sinon.SinonStub;
let sendMailSpy: sinon.SinonSpy;

module.exports = {
  setUp(callback) {
    setGlobalLogLevel(Level.DEBUG);
    mockConsole = sinon.mock(console);
    Date.prototype.toISOString = function () {
      return 'NotADate';
    };
    callback();
  },

  testLogLevel(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz', Level.DEBUG);
    test.strictEqual(logger.logLevel, Level.DEBUG);
    test.strictEqual(logger.label, 'hucairz');

    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- debug!`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- info!`);
    mockConsole.expects('log').withExactArgs(chalk.cyan(`WARN [NotADate #${process.pid}] hucairz --- warn!`));
    mockConsole.expects('log').withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] hucairz --- error!`));
    mockConsole.expects('log').withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] hucairz --- error!`));
    mockConsole.expects('log').withExactArgs(chalk.bgRed.white(`FATAL [NotADate #${process.pid}] hucairz --- fatal!`));

    logger.debug('debug!');
    logger.info('info!');
    logger.warn('warn!');
    logger.error('error!');

    logger = getLogger('hucairz', Level.ERROR);
    test.strictEqual(logger.logLevel, Level.ERROR);

    logger.info('info!');
    logger.debug('debug!');
    logger.warn('warn!');
    logger.error('error!');
    logger.fatal('fatal!');

    mockConsole.verify();
    test.done();
  },

  testPrefix(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz');
    test.strictEqual(logger.generatePrefix(Level.DEBUG), `DEBUG [NotADate #${process.pid}] hucairz --- `);

    logger = getLogger('other');
    test.strictEqual(logger.generatePrefix(Level.DEBUG), `DEBUG [NotADate #${process.pid}] other --- `);

    mockConsole.verify();
    test.done();
  },

  testColorMessage(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz');

    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.DEFAULT)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.NORMAL)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.MEDIUM)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.STRONG)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.VERY_STRONG)), 'xxx');
    test.done();
  },

  testNonString(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz', Level.DEBUG);
    let obj = generateObject();
    let maxDebugMessageLength = logger.maxDebugMessageLength;

    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- ${JSON.stringify(obj)}`);
    mockConsole.expects('log').withExactArgs(
      `DEBUG [NotADate #${process.pid}] hucairz --- ${JSON.stringify(obj).substr(0, maxDebugMessageLength)}`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- 1`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- undefined`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- null`);

    logger.info(obj);
    logger.debug(obj);
    logger.info(1);
    logger.info(undefined);
    logger.info(null);

    mockConsole.verify();
    test.done();
  },

  testMaxDebugMessageLength(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz', Level.DEBUG, 1);
    test.strictEqual(logger.maxDebugMessageLength, 1);

    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- X`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- XXX`);
    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- XX`);
    mockConsole.expects('log').withExactArgs(`INFO [NotADate #${process.pid}] hucairz --- XXX`);

    logger.debug('XXX');
    logger.info('XXX');

    logger.maxDebugMessageLength = 2;
    test.strictEqual(logger.maxDebugMessageLength, 2);

    logger.debug('XXX');
    logger.info('XXX');

    mockConsole.verify();
    test.done();
  },

  testLoggerOptions(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz', Level.DEBUG);
    test.strictEqual(logger.logLevel, Level.DEBUG);
    test.strictEqual(logger.label, 'hucairz');

    let maxDebugMessageLength = logger.maxDebugMessageLength;
    let options: LoggerOptions = {
      logPrefix: '|logPrefix|',
      emphasis: Emphasis.NORMAL,
      maxLength: maxDebugMessageLength
    };

    let longObject = {
      foo: 'a long string to make on object whose string representation should exceed the default prefix length',
      bar: 'another nice long string to make sure'
    };


    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- |logPrefix| debug with options`);
    mockConsole.expects('log').withExactArgs(
      logger.colorMessage(`DEBUG [NotADate #${process.pid}] hucairz --- |logPrefix| debug with options`, Emphasis.VERY_STRONG));
    mockConsole.expects('log').withExactArgs(
      `DEBUG [NotADate #${process.pid}] hucairz --- |logPrefix| ${JSON.stringify(longObject).substr(0, maxDebugMessageLength)}`);
    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- |logPrefix| ${JSON.stringify(longObject)}`);
    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- empty options`);

    logger.debug('debug with options', options);

    options.emphasis = Emphasis.VERY_STRONG;
    logger.debug('debug with options', options);

    options.emphasis = Emphasis.NORMAL;
    logger.debug(longObject, options);
    options.maxLength = MSG_LEN_UNLIMITED;
    logger.debug(longObject, options);
    logger.debug('empty options', {});

    mockConsole.verify();
    test.done();
  },

  testStringify(test: nodeunit.Test) {
    let logger: any = getLogger('hucairz');
    let e = new Error('message');
    let obj = { a: 123 };
    test.strictEqual(logger.stringify(undefined), 'undefined');
    test.strictEqual(logger.stringify(e), `${e.message}\n${e.stack}`);
    test.strictEqual(logger.stringify('message'), 'message');
    test.strictEqual(logger.stringify(1), '1');
    test.strictEqual(logger.stringify(obj, 3), JSON.stringify(obj).substr(0, 3));
    test.strictEqual(logger.stringify(obj, -1), JSON.stringify(obj));

    test.done();
  },

  testSetGlobalLogLevelEnum(test: nodeunit.Test) {
    let logger = getLogger('hucairz', Level.WARN);
    mockConsole.expects('log').twice();

    setGlobalLogLevel(Level.WARN);
    logger.warn('hi');

    setGlobalLogLevel(Level.ERROR);
    logger.warn('hi');

    setGlobalLogLevel(Level.WARN);
    logger.warn('hi');

    mockConsole.verify();
    test.done();
  },

  testSetGlobalLogLevelString(test: nodeunit.Test) {
    let logger = getLogger('hucairz', Level.WARN);
    mockConsole.expects('log').twice();

    setGlobalLogLevel('WARN');
    logger.warn('hi');

    setGlobalLogLevel('ERROR');
    logger.warn('hi');

    setGlobalLogLevel('WARN');
    logger.warn('hi');

    test.throws(() => setGlobalLogLevel('NOTALOGLEVEL'), Error, 'Invalid default log level NOTALOGLEVEL');
    test.throws(() => setGlobalLogLevel(<any>false), Error, 'Invalid default log level false');

    mockConsole.verify();
    test.done();
  },

  testSuppressTag(test: nodeunit.Test) {
    let logger = getLogger('hucairz', Level.DEBUG);

    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- with tag`);
    mockConsole.expects('log').withExactArgs(`suppress tag`);

    logger.debug('with tag');
    logger.debug('suppress tag', { suppressTag: true });

    mockConsole.verify();
    test.done();

  },

  testSetUpEmail(test: nodeunit.Test) {
    let module = createMocks();
    test.strictEqual(createTransportSpy.callCount, 1);
    test.deepEqual(createTransportSpy.firstCall.args, ['smtp://mail.ganchrow.com']);

    module.setUpMailer({
      to: 'me',
      from: 'you',
      subjectPrefix: 'Prefix'
    });

    let logger = module.getLogger('mailer');
    mockConsole.expects('log');
    logger.fatal('a fatal message');

    test.strictEqual(sendMailSpy.callCount, 1);
    test.deepEqual(sendMailSpy.firstCall.args[0], {
      from: 'you',
      to: 'me',
      subject: 'Prefix: FATAL',
      text: `FATAL [NotADate #${process.pid}] mailer --- a fatal message`
    });
    mockConsole.verify();
    test.done();
  },

  testSetUpEmailWithLogLevel(test: nodeunit.Test) {
    let module = createMocks();
    test.strictEqual(createTransportSpy.callCount, 1);
    test.deepEqual(createTransportSpy.firstCall.args, ['smtp://mail.ganchrow.com']);

    module.setUpMailer({
      to: 'me',
      from: 'you',
      subjectPrefix: 'Prefix',
      minLogLevel: Level.WARN
    });

    let logger = module.getLogger('mailer');
    mockConsole.expects('log');
    mockConsole.expects('log');

    logger.warn('a warn message');
    logger.info('an info message');

    test.strictEqual(sendMailSpy.callCount, 1);
    test.deepEqual(sendMailSpy.firstCall.args[0], {
      from: 'you',
      to: 'me',
      subject: 'Prefix: WARN',
      text: `WARN [NotADate #${process.pid}] mailer --- a warn message`
    });
    mockConsole.verify();
    test.done();
  },

  testInstallUncaughtExceptionLogger(test: nodeunit.Test) {
    let logger = getLogger('handler');
    mockConsole.expects('log');
    logger.installUncaughtExceptionLogger();

    let mockError = {};
    try {
      process.emit('uncaughtException', mockError);
    } catch (e) {
      test.strictEqual(e, mockError);
    }
    mockConsole.verify();
    test.done();
  },

  testInvokeCallback(test: nodeunit.Test) {
    let label = 'invoke callback';
    let logger = getLogger(label, Level.DEBUG);
    let logMessage = 'test callback';
    let callbackMessage = 'im in ur callback callin ur d00dz';
    mockConsole.expects('log').
      withExactArgs(`INFO [NotADate #${process.pid}] ${label} --- ${logMessage}`);
    mockConsole.expects('log').withExactArgs(callbackMessage);

    /* tslint:disable:no-console */
    logger.info(logMessage, () => {
      console.log(callbackMessage);
    });
    /* tslint:disable:no-console */

    mockConsole.verify();
    test.done();
  },

  tearDown(callback) {
    mockConsole.restore();
    Date.prototype.toISOString = originalISOString;
    callback();
  }
};

function createMocks() {
  sendMailSpy = sinon.spy();
  createTransportSpy = sinon.stub();
  createTransportSpy.returns({
    sendMail: sendMailSpy
  });

  return proxyquire('../src/gsLogger',
    {
      'nodemailer': {
        createTransport: createTransportSpy
      }
    });
}

function generateObject(): number[] {
  let array = [];
  for (let i = 0; i < 100; i++) {
    array.push(i);
  }
  return array;
}


