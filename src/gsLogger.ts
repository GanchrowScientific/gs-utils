/* Copyright © 2016-2023 Ganchrow Scientific, SA all rights reserved */

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
const DEFAULT_MAX_DEBUG_MESSAGE_LENGTH = 64;
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

  constructor(
    private label: string,
    private logLevel: Level = Logger.defaultLogLevel,
    public maxDebugMessageLength: number = DEFAULT_MAX_DEBUG_MESSAGE_LENGTH,
    private mailer: {transporter?: nodemailer.Transporter, mailerOptions?: MailerOptions} = {}
  ) { /* */ }

  public debug(message: any, options?: LoggerOptions) {
    let emphasis: Emphasis = Emphasis.DEFAULT;
    let maxLength: number;
    let logPrefix: string;
    let suppressTag: boolean;
    let callback: NoArgVoidFunc;

    if (options) {
      if (options.emphasis) {
        emphasis = options.emphasis;
      }
      maxLength = options.maxLength;
      logPrefix = options.logPrefix;
      suppressTag = options.suppressTag;
      callback = options.callback;
    }

    maxLength = typeof maxLength === 'number' ? maxLength : this.maxDebugMessageLength;

    this.logInternal(message, emphasis, Level.DEBUG, callback, maxLength, logPrefix, suppressTag);
  }

  public info(message: any, callback?: NoArgVoidFunc) {
    this.logInternal(message, Emphasis.NORMAL, Level.INFO, callback);
  }

  public warn(message: any, callback?: NoArgVoidFunc) {
    this.logInternal(message, Emphasis.MEDIUM, Level.WARN, callback);
  }

  public error(message: any, callback?: NoArgVoidFunc) {
    this.logInternal(message, Emphasis.STRONG, Level.ERROR, callback);
  }

  public fatal(message: any, callback?: NoArgVoidFunc) {
    this.logInternal(message, Emphasis.VERY_STRONG, Level.FATAL, callback);
  }

  public installUncaughtExceptionLogger() {
    process.on('uncaughtException', (err: Error) => {
      this.fatal(err.message);
      throw err;
    });
  }

  private logInternal(message: any, emphasis: Emphasis, level: Level, callback?: NoArgVoidFunc,
    maxLength = MSG_LEN_UNLIMITED, logPrefix?: string, suppressTag?: boolean) {
    if (level >= this.getActualLogLevel()) {
      let stringMessage = this.stringify(message, maxLength);
      let fullMessage = this.generatePrefix(level, logPrefix, suppressTag) + stringMessage;
      let logMessage = this.colorMessage(fullMessage, emphasis);
      /* tslint:disable:no-console */
      console.log(logMessage);
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
    return maxLength === MSG_LEN_UNLIMITED ? stringMessage : stringMessage.substr(0, maxLength);
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
    suppressTag = false): string {
    logPrefix = logPrefix ? `${logPrefix} ` : '';
    let messageTag = suppressTag ? '' :
      `${Level[level]} [${new Date().toISOString()} #${process.pid}] ${this.label} --- `;

    return `${messageTag}${logPrefix}`;
  }

  private getActualLogLevel(): Level {
    return Math.max(globalLogLevel, this.logLevel);
  }

  private sendEmailNotification(logMessage, level: Level, callback?: OptArgCbFunc) {
    let mailerOptions = this.mailer.mailerOptions || Logger.mailerOptions;
    (this.mailer.transporter || transporter).sendMail({
      from: mailerOptions.from,
      to: mailerOptions.to,
      subject: mailerOptions.subjectPrefix + ': ' + Level[level],
      text: logMessage
    }, function (error, info) {
      /* tslint:disable:no-console */
      if (error) {
        console.log(`Failed to send email notification with mailer options: ${JSON.stringify(mailerOptions)}`);
        console.log(error);
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
