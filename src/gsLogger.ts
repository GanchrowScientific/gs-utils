/* Copyright © 2016-2025 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as brokenChalk from 'chalk';
import * as nodemailer from 'nodemailer';
import { OptArgCbFunc, NoArgVoidFunc } from './utilities';

const SMTP_SERVER = 'smtp-relay.gmail.com';

const chalk: any = brokenChalk;

export const MSG_LEN_UNLIMITED = -1;

export enum Emphasis {
  DEFAULT, NORMAL, MEDIUM, STRONG, VERY_STRONG
}

export enum Level {
  DEBUG, INFO, WARN, ERROR, FATAL, NONE
}

function levelString() {
  return Object.keys(Level).filter(level =>
    Number.isNaN(Number.parseInt(level, 10))).join(', ');
}

const DEFAULT_LOG_LEVEL = Level.DEBUG;
const DEFAULT_MAX_DEBUG_MESSAGE_LENGTH = 256;
const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: 465,
  secure: true,
  debug: true
});

let globalLogLevel = DEFAULT_LOG_LEVEL;

export interface LoggerOptions {
  maxLength?: number;
  logPrefix?: string;
  emphasis?: Emphasis;
  suppressTag?: boolean;
  callback?: NoArgVoidFunc;
  /**
   * Optional ISO timestamp to embed in the log-line prefix instead of the
   * wall-clock at emission. When omitted, the prefix uses
   * `new Date().toISOString()` (legacy behaviour).
   *
   * Intended for callers that need the prefix timestamp to reflect a
   * different moment than the emission instant — for example, recording the
   * time a downstream operation actually started rather than the time the
   * log line was flushed. Caller is responsible for producing a valid ISO
   * string; nothing is validated here.
   *
   * Backward-compatible: pre-existing callers that don't pass this field
   * keep the previous `new Date().toISOString()` behaviour exactly.
   */
  timestamp?: string;
}

export interface MailerOptions {
  to: string;
  from: string;
  subjectPrefix: string;
  minLogLevel?: Level; // specifies minimum log level to mail, or defatult to FATAL
}

const MAILER_DEFAULTS: MailerOptions = {
  to: 'Admin <admin@example.com>',
  from: 'System <system@example.com>',
  minLogLevel: Level.FATAL,
  subjectPrefix: 'Log notification'
};

export class Logger {
  public static defaultLogLevel: Level = DEFAULT_LOG_LEVEL;

  public static mailerOptions: MailerOptions;

  private pid: string;

  constructor(
    private label: string,
    private logLevel: Level = Logger.defaultLogLevel,
    public maxDebugMessageLength: number = DEFAULT_MAX_DEBUG_MESSAGE_LENGTH,
    private mailer: {transporter?: nodemailer.Transporter, mailerOptions?: MailerOptions} = {}
  ) {
    this.pid = process.env.GSLOGGER_HOSTNAME_AS_PID ? process.env.HOSTNAME || `${process.pid}` : `${process.pid}`;
  }

  public debug(message: any, options?: LoggerOptions | string) {
    let emphasis: Emphasis = Emphasis.DEFAULT;
    let maxLength: number;
    let logPrefix: string;
    let suppressTag: boolean;
    let callback: NoArgVoidFunc;
    let timestamp: string;

    if (typeof options === 'string') {
      logPrefix = options;
    } else if (options) {
      if (options.emphasis) {
        emphasis = options.emphasis;
      }
      maxLength = options.maxLength;
      logPrefix = options.logPrefix;
      suppressTag = options.suppressTag;
      callback = options.callback;
      timestamp = options.timestamp;
    }

    maxLength = typeof maxLength === 'number' ? maxLength : this.maxDebugMessageLength;

    this.logInternal(message, emphasis, Level.DEBUG, callback, maxLength, logPrefix, suppressTag, timestamp);
  }

  public info(message: any, callbackOrPrefixOrOptions?: string | NoArgVoidFunc | LoggerOptions, callback?: NoArgVoidFunc) {
    const { logPrefix, cb, timestamp } = this.resolveLevelArgs(callbackOrPrefixOrOptions, callback);
    this.logInternal(message, Emphasis.NORMAL, Level.INFO, cb, MSG_LEN_UNLIMITED, logPrefix, undefined, timestamp);
  }

  public warn(message: any, callbackOrPrefixOrOptions?: string | NoArgVoidFunc | LoggerOptions, callback?: NoArgVoidFunc) {
    const { logPrefix, cb, timestamp } = this.resolveLevelArgs(callbackOrPrefixOrOptions, callback);
    this.logInternal(message, Emphasis.MEDIUM, Level.WARN, cb, MSG_LEN_UNLIMITED, logPrefix, undefined, timestamp);
  }

  public error(message: any, callbackOrPrefixOrOptions?: string | NoArgVoidFunc | LoggerOptions, callback?: NoArgVoidFunc) {
    const { logPrefix, cb, timestamp } = this.resolveLevelArgs(callbackOrPrefixOrOptions, callback);
    this.logInternal(message, Emphasis.STRONG, Level.ERROR, cb, MSG_LEN_UNLIMITED, logPrefix, undefined, timestamp);
  }

  public fatal(message: any, callbackOrPrefixOrOptions?: string | NoArgVoidFunc | LoggerOptions, callback?: NoArgVoidFunc) {
    const { logPrefix, cb, timestamp } = this.resolveLevelArgs(callbackOrPrefixOrOptions, callback);
    this.logInternal(message, Emphasis.VERY_STRONG, Level.FATAL, cb, MSG_LEN_UNLIMITED, logPrefix, undefined, timestamp);
  }

  /**
   * Disambiguate the polymorphic second argument used by info/warn/error/fatal.
   *
   * Historical signature: `(message, prefixOrCallback?, callback?)` — the
   * second arg could be a `logPrefix` string OR a `NoArgVoidFunc` callback.
   * We extend it here so the second arg can ALSO be a `LoggerOptions` object,
   * which lets callers pass `{ timestamp, logPrefix, callback }` per call
   * without changing the existing call sites.
   *
   * Returns a normalised triple { logPrefix, cb, timestamp } that the level
   * methods feed straight into `logInternal`. Keeping this in one place keeps
   * info/warn/error/fatal short and identical in shape.
   */
  private resolveLevelArgs(
    arg: string | NoArgVoidFunc | LoggerOptions | undefined,
    cbArg: NoArgVoidFunc | undefined,
  ): { logPrefix?: string; cb?: NoArgVoidFunc; timestamp?: string } {
    if (typeof arg === 'string') {
      // Legacy two-arg form: (message, logPrefix, callback?)
      return { logPrefix: arg, cb: cbArg };
    }
    if (typeof arg === 'function') {
      // Legacy: (message, callback)
      return { cb: arg };
    }
    if (arg && typeof arg === 'object') {
      // New: (message, { timestamp, logPrefix, callback })
      // Per-call `callback` on the options object wins over a trailing one,
      // matching how `debug` already behaves when both are supplied.
      return {
        logPrefix: arg.logPrefix,
        cb: arg.callback ?? cbArg,
        timestamp: arg.timestamp,
      };
    }
    // Nothing supplied (and no trailing callback either)
    return { cb: cbArg };
  }

  public installUncaughtExceptionLogger() {
    process.on('uncaughtException', (err: Error) => {
      this.fatal(err.message);
      throw err;
    });
  }

  private logInternal(message: any, emphasis: Emphasis, level: Level, callback?: NoArgVoidFunc,
    maxLength = MSG_LEN_UNLIMITED, logPrefix?: string, suppressTag?: boolean, timestamp?: string) {
    if (level >= this.getActualLogLevel()) {
      let stringMessage = this.stringify(message, maxLength);
      let fullMessage = this.generatePrefix(level, logPrefix, suppressTag, timestamp) + stringMessage;
      let logMessage = this.colorMessage(fullMessage, emphasis);
      let op = (process.env.IS_KUBERNETES || process.env.IS_K8S) && (level === Level.ERROR || level === Level.FATAL) ? 'error' : 'log';
      /* tslint:disable:no-console */
      console[op](logMessage);
      /* tslint:enable:no-console */
      if (this.shouldSendMail(level)) {
        this.sendEmailNotification(fullMessage, level, callback);
        return;
      }
    }
    if (callback) {
      process.nextTick(callback);
    }
  }

  private stringify(message: any, maxLength: number): string {
    let stringMessage: string;

    switch (typeof message) {
      case 'object':
        if (message instanceof Error) {
          stringMessage = `${message.message}\n${message.stack}`;
        } else {
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
    return maxLength === MSG_LEN_UNLIMITED ? stringMessage : stringMessage.slice(0, maxLength);
  }

  private colorMessage(fullMessage: string, emphasis: Emphasis): string {
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
        return chalk.bgRed.white(fullMessage).toString();
    }
  }

  private generatePrefix(level: Level, logPrefix = '',
    suppressTag = false, timestamp?: string): string {
    logPrefix = logPrefix ? `${logPrefix} ` : '';
    // When the caller passes a per-call `timestamp` (via the LoggerOptions
    // overload on info/warn/error/fatal, or via `LoggerOptions.timestamp` on
    // debug), embed it in the prefix — but only if it parses as a valid
    // date. A bad value would silently corrupt every line for downstream
    // log aggregators, so we treat invalid input as "no value supplied" and
    // fall back to the wall-clock at emission (legacy behaviour).
    const stamp = this.normalizeTimestamp(timestamp);
    let messageTag = suppressTag ? '' :
      `${Level[level]} [${stamp} #${this.pid}] ${this.label} --- `;

    return `${messageTag}${logPrefix}`;
  }

  /**
   * Return the caller's `timestamp` verbatim when it parses as a valid date,
   * else fall back to `new Date().toISOString()`.
   *
   * The validity check is `!Number.isNaN(new Date(value).getTime())`. This
   * accepts ISO 8601 strings (the expected and most common input), and also
   * RFC 2822 / locale-parseable forms — but those are tolerated, not
   * encouraged: callers should pass ISO so the log prefix stays uniform.
   *
   * We intentionally **echo the caller's exact string** instead of
   * round-tripping through `parsed.toISOString()`. Round-tripping would
   * canonicalise alternate-but-valid forms (e.g. `'2026-05-21'` →
   * `'2026-05-21T00:00:00.000Z'`) and silently truncate sub-millisecond
   * precision — both surprising behaviours for a "just stamp this" API.
   * If a caller passes a non-ISO valid date, they get exactly what they
   * passed; the validation here exists only to keep garbage out.
   *
   * Empty string, null, and undefined are treated as "no timestamp
   * supplied" without going through `new Date(...)`, because `new Date(null)`
   * evaluates to the Unix epoch (valid but almost certainly unintended) and
   * we want those to behave like omitting the field.
   */
  private normalizeTimestamp(timestamp?: string): string {
    if (timestamp == null || timestamp === '') {
      return new Date().toISOString();
    }
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return timestamp;
  }

  private getActualLogLevel(): Level {
    return Math.max(globalLogLevel, this.logLevel);
  }

  private sendEmailNotification(logMessage: string, level: Level, callback?: OptArgCbFunc) {
    let mailerOptions = this.mailer.mailerOptions || Logger.mailerOptions;
    (this.mailer.transporter || transporter).sendMail({
      from: mailerOptions.from,
      to: mailerOptions.to,
      subject: mailerOptions.subjectPrefix + ': ' + Level[level],
      text: logMessage
    }, function (error: Error, info: any) {
      /* tslint:disable:no-console */
      if (error) {
        let op = process.env.IS_KUBERNETES || process.env.IS_K8S ? 'error' : 'log';
        console[op](`Failed to send email notification with mailer options: ${JSON.stringify(mailerOptions)}`);
        console[op](error);
      } else {
        console.log(`Email notification sent to '${mailerOptions.to}': ${info.response}`);
      }
      /* tslint:disable:no-console */
      if (callback) {
        callback(error, error ? null : info);
      }
    });
  }

  private shouldSendMail(level: Level): boolean {
    let defaultMailerOptions = Logger.mailerOptions;
    let mailerOptions = this.mailer.mailerOptions || defaultMailerOptions;
    return mailerOptions && level >= (
      Level[mailerOptions.minLogLevel] ?
        mailerOptions.minLogLevel :
        defaultMailerOptions && defaultMailerOptions.minLogLevel || globalLogLevel
    );
  }
}

// To set up email, invoke the following method:
//
// setUpMailer({
//   to: 'Admin <admin@example.com>',
//   from: 'System <system@example.com>',
//   subjectPrefix: 'Log notification',
//   minLogLevel: Level.FATAL
// });
//
// Installs the email transport
export function setUpMailer(mailerOptions: MailerOptions = MAILER_DEFAULTS) {
  Logger.mailerOptions = Object.assign({}, MAILER_DEFAULTS, mailerOptions);
}

export function setGlobalLogLevel(logLevel: Level | string) {
  let logLevelEnum: Level;
  if (Level.hasOwnProperty(logLevel.toString())) {
    logLevelEnum = Number.isNaN(Number.parseInt(<any>logLevel, 10)) ? Level[logLevel] : logLevel;
  } else {
    throw new Error(`Invalid default log level ${logLevel}.\nValid levels are ${levelString()}.`);
  }
  globalLogLevel = logLevelEnum;
}

export function getLogger(label: string, logLevel?: Level, maxDebugMessageLength?: number): Logger {
  return new Logger(label, logLevel, maxDebugMessageLength);
}
