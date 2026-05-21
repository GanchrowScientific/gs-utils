/* Copyright © 2016-2025 Ganchrow Scientific, SA all rights reserved */
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

[true, false].forEach(isK8s => {
  process.env.IS_KUBERNETES = isK8s ? '1' : '';
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
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log').withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] hucairz --- error!`));
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log').withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] hucairz --- error!`));
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log').withExactArgs(chalk.bgRed.white(`FATAL [NotADate #${process.pid}] hucairz --- fatal!`));

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
        `DEBUG [NotADate #${process.pid}] hucairz --- ${JSON.stringify(obj).slice(0, maxDebugMessageLength)}`);
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
        `DEBUG [NotADate #${process.pid}] hucairz --- |logPrefix| ${JSON.stringify(longObject).slice(0, maxDebugMessageLength)}`);
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
      test.strictEqual(logger.stringify(obj, 3), JSON.stringify(obj).slice(0, 3));
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
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log');
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
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log').exactly(1);
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
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log')
        .withExactArgs(chalk.red(`ERROR [NotADate #${process.pid}] SendMailWithLoggerInstance --- email me`));
      mockConsole.expects(process.env.IS_KUBERNETES ? 'error' : 'log')
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

    /**
     * Tests for the per-call `timestamp` field on `LoggerOptions`. When the
     * caller supplies it on a log call, the prefix uses that ISO verbatim;
     * when omitted, the prefix falls back to `new Date().toISOString()` and
     * the outer beforeEach's stub returns `NotADate`.
     */
    describe('per-call timestamp option', () => {
      it('debug: uses the supplied timestamp instead of the wall-clock', () => {
        let logger = getLogger('per-call', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `DEBUG [2026-05-21T10:00:00.000Z #${process.pid}] per-call --- with stamp`);

        logger.debug('with stamp', { timestamp: '2026-05-21T10:00:00.000Z' });

        mockConsole.verify();
      });

      it('debug: falls back to wall-clock when timestamp omitted', () => {
        let logger = getLogger('per-call', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `DEBUG [NotADate #${process.pid}] per-call --- no stamp`);

        logger.debug('no stamp');

        mockConsole.verify();
      });

      // One test per level — `it.each` isn't available in the jasmine
      // version this repo uses, so we spell out info/warn/error/fatal
      // separately. Each level wraps its prefix in a different chalk style
      // (NORMAL -> stripColor, MEDIUM -> cyan, STRONG -> red, VERY_STRONG ->
      // bgRed.white) and the assertions use that exact wrapper, matching
      // the style of the legacy "should return log level" test at the top
      // of this file.

      it('info: accepts a LoggerOptions second arg with timestamp', () => {
        let logger = getLogger('per-call-info', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `INFO [2026-05-21T10:00:00.000Z #${process.pid}] per-call-info --- msg`);

        logger.info('msg', { timestamp: '2026-05-21T10:00:00.000Z' });

        mockConsole.verify();
      });

      it('warn: accepts a LoggerOptions second arg with timestamp', () => {
        let logger = getLogger('per-call-warn', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.cyan(
          `WARN [2026-05-21T10:00:00.000Z #${process.pid}] per-call-warn --- msg`));

        logger.warn('msg', { timestamp: '2026-05-21T10:00:00.000Z' });

        mockConsole.verify();
      });

      it('error: accepts a LoggerOptions second arg with timestamp', () => {
        let logger = getLogger('per-call-error', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.red(
          `ERROR [2026-05-21T10:00:00.000Z #${process.pid}] per-call-error --- msg`));

        logger.error('msg', { timestamp: '2026-05-21T10:00:00.000Z' });

        mockConsole.verify();
      });

      it('fatal: accepts a LoggerOptions second arg with timestamp', () => {
        let logger = getLogger('per-call-fatal', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.bgRed.white(
          `FATAL [2026-05-21T10:00:00.000Z #${process.pid}] per-call-fatal --- msg`));

        logger.fatal('msg', { timestamp: '2026-05-21T10:00:00.000Z' });

        mockConsole.verify();
      });

      it('info: preserves the legacy (message, logPrefix) two-arg form', () => {
        let logger = getLogger('legacy', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `INFO [NotADate #${process.pid}] legacy --- |pfx| hello`);

        logger.info('hello', '|pfx|');

        mockConsole.verify();
      });

      it('info: preserves the legacy (message, callback) two-arg form', done => {
        let logger = getLogger('legacy-cb', Level.DEBUG);
        mockConsole.expects('log').withExactArgs(
          `INFO [NotADate #${process.pid}] legacy-cb --- hi`);

        logger.info('hi', () => {
          mockConsole.verify();
          done();
        });
      });

      it('info: LoggerOptions callback is invoked on next tick', done => {
        let logger = getLogger('cb-in-opts', Level.DEBUG);
        mockConsole.expects('log');
        logger.info('hi', {
          timestamp: '2026-05-21T10:00:00.000Z',
          callback: () => {
            mockConsole.verify();
            done();
          },
        });
      });

      it('info: trailing callback still fires when LoggerOptions has no callback field', done => {
        // Backward compat: callers historically pass the callback as the
        // third positional arg. The new options form still respects that as
        // a fallback when `options.callback` isn't provided.
        let logger = getLogger('trailing-cb', Level.DEBUG);
        mockConsole.expects('log');
        logger.info('hi', { timestamp: '2026-05-21T10:00:00.000Z' }, () => {
          mockConsole.verify();
          done();
        });
      });

      /**
       * Validation: when the caller-supplied `timestamp` doesn't parse as a
       * date, the prefix MUST fall back to the wall-clock (`NotADate` in
       * these tests because of the outer toISOString stub). This protects
       * downstream log aggregators from being fed garbage in the timestamp
       * slot when a code path computes a malformed value.
       */
      it('falls back to wall-clock when timestamp is a non-date string', () => {
        let logger = getLogger('bad-stamp', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `DEBUG [NotADate #${process.pid}] bad-stamp --- garbage in`);

        logger.debug('garbage in', { timestamp: 'not a real date' });

        mockConsole.verify();
      });

      it('falls back to wall-clock when timestamp is an empty string', () => {
        let logger = getLogger('empty-stamp', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `DEBUG [NotADate #${process.pid}] empty-stamp --- empty`);

        logger.debug('empty', { timestamp: '' });

        mockConsole.verify();
      });

      it('falls back to wall-clock when timestamp is null/undefined-equivalent', () => {
        // The Date constructor would treat `null` as the Unix epoch (valid
        // but almost certainly unintended), so the normaliser short-circuits
        // null/undefined to the default before touching `new Date(...)`.
        let logger: any = getLogger('null-stamp', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `DEBUG [NotADate #${process.pid}] null-stamp --- null in`);

        logger.debug('null in', { timestamp: null });

        mockConsole.verify();
      });

      // Per-level fallback tests, one apiece (no it.each / for-loop) so
      // failures point at the specific level that broke. Each asserts the
      // chalk-wrapped output uses the wall-clock fallback (`NotADate`)
      // when the supplied timestamp doesn't parse.

      it('info: falls back to wall-clock on invalid timestamp', () => {
        let logger = getLogger('bad-info', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(
          `INFO [NotADate #${process.pid}] bad-info --- msg`);

        logger.info('msg', { timestamp: 'wat' });

        mockConsole.verify();
      });

      it('warn: falls back to wall-clock on invalid timestamp', () => {
        let logger = getLogger('bad-warn', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.cyan(
          `WARN [NotADate #${process.pid}] bad-warn --- msg`));

        logger.warn('msg', { timestamp: 'wat' });

        mockConsole.verify();
      });

      it('error: falls back to wall-clock on invalid timestamp', () => {
        let logger = getLogger('bad-error', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.red(
          `ERROR [NotADate #${process.pid}] bad-error --- msg`));

        logger.error('msg', { timestamp: 'wat' });

        mockConsole.verify();
      });

      it('fatal: falls back to wall-clock on invalid timestamp', () => {
        let logger = getLogger('bad-fatal', Level.DEBUG);

        mockConsole.expects('log').withExactArgs(chalk.bgRed.white(
          `FATAL [NotADate #${process.pid}] bad-fatal --- msg`));

        logger.fatal('msg', { timestamp: 'wat' });

        mockConsole.verify();
      });

      it('passes the supplied timestamp to the mailed text body', () => {
        // The email body comes from `fullMessage` which is built from
        // generatePrefix — so the per-call stamp must appear there too.
        let module = createMocks();
        module.setUpMailer({
          to: 'me',
          from: 'you',
          subjectPrefix: 'Prefix',
          minLogLevel: module.Level.FATAL,
        });

        let logger = module.getLogger('mailer-per-call');
        mockConsole.expects('log');
        logger.fatal('boom', { timestamp: '2026-05-21T10:00:00.000Z' });

        test.strictEqual(sendMailSpy.callCount, 1);
        test.deepEqual(sendMailSpy.firstCall.args[0], {
          from: 'you',
          to: 'me',
          subject: 'Prefix: FATAL',
          text: `FATAL [2026-05-21T10:00:00.000Z #${process.pid}] mailer-per-call --- boom`,
        });
        mockConsole.verify();
      });
    });
  });
  process.env.IS_KUBERNETES = undefined;
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


