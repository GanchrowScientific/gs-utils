/* Copyright © 2016-2023 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import * as pq from 'proxyquire';
import * as brokenChalk from 'chalk';

import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { Logger, getLogger, Level, Emphasis, LoggerOptions, MSG_LEN_UNLIMITED, setGlobalLogLevel }
from '../src/gsLogger';

const test = testWrapper.init(expect);

const chalk: any = brokenChalk;

let proxyquire = pq.noPreserveCache();
let mockConsole: sinon.SinonMock;
let originalISOString = Date.prototype.toISOString;
let createTransportSpy: sinon.SinonStub;
let sendMailSpy: sinon.SinonSpy;

describe('Logger', () => {
  beforeEach(() => {
    setGlobalLogLevel(Level.DEBUG);
    mockConsole = sinon.mock(console);
    Date.prototype.toISOString = function () {
      return 'NotADate';
    };
  });

  afterEach(() => {
    mockConsole.restore();
    Date.prototype.toISOString = originalISOString;
  });

  it('should return log level', () => {
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
  });

  it('should have prefix', () => {
    let logger: any = getLogger('hucairz');
    test.strictEqual(logger.generatePrefix(Level.DEBUG), `DEBUG [NotADate #${process.pid}] hucairz --- `);

    logger = getLogger('other');
    test.strictEqual(logger.generatePrefix(Level.DEBUG), `DEBUG [NotADate #${process.pid}] other --- `);

    mockConsole.verify();
  });

  it('should color message', () => {
    let logger: any = getLogger('hucairz');

    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.DEFAULT)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.NORMAL)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.MEDIUM)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.STRONG)), 'xxx');
    test.strictEqual(chalk.stripColor(logger.colorMessage('xxx', Emphasis.VERY_STRONG)), 'xxx');
  });

  it('should handle non strings', () => {
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
  });

  it('should have max debug message length', () => {
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
  });

  it('should handle logger options', () => {
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
  });

  it('should stringify', () => {
    let logger: any = getLogger('hucairz');
    let e = new Error('message');
    let obj = { a: 123 };
    test.strictEqual(logger.stringify(undefined), 'undefined');
    test.strictEqual(logger.stringify(e), `${e.message}\n${e.stack}`);
    test.strictEqual(logger.stringify('message'), 'message');
    test.strictEqual(logger.stringify(1), '1');
    test.strictEqual(logger.stringify(obj, 3), JSON.stringify(obj).substr(0, 3));
    test.strictEqual(logger.stringify(obj, -1), JSON.stringify(obj));
  });

  it('should set global enum log level', () => {
    let logger = getLogger('hucairz', Level.WARN);
    mockConsole.expects('log').twice();

    setGlobalLogLevel(Level.WARN);
    logger.warn('hi');

    setGlobalLogLevel(Level.ERROR);
    logger.warn('hi');

    setGlobalLogLevel(Level.WARN);
    logger.warn('hi');

    mockConsole.verify();
  });

  it('should set global string log level', () => {
    let logger = getLogger('hucairz', Level.WARN);
    mockConsole.expects('log').twice();

    setGlobalLogLevel('WARN');
    logger.warn('hi');

    setGlobalLogLevel('ERROR');
    logger.warn('hi');

    setGlobalLogLevel('WARN');
    logger.warn('hi');

    test.throws(() => setGlobalLogLevel('NOTALOGLEVEL'), new Error([
      'Invalid default log level NOTALOGLEVEL.',
      'Valid levels are DEBUG, INFO, WARN, ERROR, FATAL, NONE.'
    ].join('\n')));
    test.throws(() => setGlobalLogLevel(<any>false), new Error([
      'Invalid default log level false.',
      'Valid levels are DEBUG, INFO, WARN, ERROR, FATAL, NONE.'
    ].join('\n')));

    mockConsole.verify();
  });

  it('should suppress tag', () => {
    let logger = getLogger('hucairz', Level.DEBUG);

    mockConsole.expects('log').withExactArgs(`DEBUG [NotADate #${process.pid}] hucairz --- with tag`);
    mockConsole.expects('log').withExactArgs(`suppress tag`);

    logger.debug('with tag');
    logger.debug('suppress tag', { suppressTag: true });

    mockConsole.verify();
  });

  it('should setup email with defaults', () => {
    let module = createMocks();
    test.strictEqual(createTransportSpy.callCount, 1);
    test.deepEqual(createTransportSpy.firstCall.args, [{
      host: 'smtp-relay.gmail.com',
      port: 465,
      secure: true,
      debug: true
    }]);

    module.setUpMailer();

    let logger = module.getLogger('mailer');
    mockConsole.expects('log');
    logger.fatal('a fatal message');

    test.strictEqual(sendMailSpy.callCount, 1);
    test.deepEqual(sendMailSpy.firstCall.args[0], {
      from: 'System <system@example.com>',
      to: 'Admin <admin@example.com>',
      subject: 'Log notification: FATAL',
      text: `FATAL [NotADate #${process.pid}] mailer --- a fatal message`
    });
    mockConsole.verify();
  });

  it('should set up email with log level', () => {
    let module = createMocks();
    test.strictEqual(createTransportSpy.callCount, 1);

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
  });

  it('should install uncaught exception logger', () => {
    // removes jasmine's uncaughtException handler
    process.removeAllListeners('uncaughtException');
    let logger = getLogger('handler');
    mockConsole.expects('log').exactly(1);
    logger.installUncaughtExceptionLogger();

    let mockError = new Error('abc');
    expect(() => (process as any).emit('uncaughtException', mockError)).toThrow(mockError);
    mockConsole.verify();
  });

  it('should invoke callback', done => {
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
      mockConsole.verify();
      done();
    });
    /* tslint:disable:no-console */

  });

  it('should send mail with logger instance', () => {
    let _ = undefined;
    let transporterMock = {
      sendMail: sinon.spy(),
      templateSender: null,
      use: null,
      verify: null
    };
    let mailerOptions = {
      from: 'Larry',
      to: 'Gunther',
      subjectPrefix: 'This is not Gunther from Friends',
      minLogLevel: Level.ERROR
    };
    let logger = new Logger(
      'SendMailWithLoggerInstance',
      Level.INFO,
      _,
      {transporter: transporterMock as any, mailerOptions: mailerOptions}
    );

    mockConsole.expects('log')
      .withExactArgs(`INFO [NotADate #${process.pid}] SendMailWithLoggerInstance --- hey`);
    mockConsole.expects('log')
      .withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] SendMailWithLoggerInstance --- email me`));
    mockConsole.expects('log')
      .withExactArgs(chalk.bgRed.white(`FATAL [NotADate #${process.pid}] SendMailWithLoggerInstance --- email me as well`));

    logger.info('hey');
    test.ok(transporterMock.sendMail.notCalled);

    logger.error('email me');
    test.ok(transporterMock.sendMail.calledOnce);
    test.deepEqual(transporterMock.sendMail.firstCall.args[0], {
      from: 'Larry',
      to: 'Gunther',
      subject: 'This is not Gunther from Friends: ERROR',
      text: `ERROR [NotADate #${process.pid}] SendMailWithLoggerInstance --- email me`
    });

    logger.fatal('email me as well');
    test.ok(transporterMock.sendMail.calledTwice);
    test.deepEqual(transporterMock.sendMail.secondCall.args[0], {
      from: 'Larry',
      to: 'Gunther',
      subject: 'This is not Gunther from Friends: FATAL',
      text: `FATAL [NotADate #${process.pid}] SendMailWithLoggerInstance --- email me as well`
    });

    mockConsole.verify();
  });
});

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


