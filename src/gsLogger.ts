/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as chalk from 'chalk';

export const MSG_LEN_UNLIMITED = -1;

export enum Emphasis {
  DEFAULT, NORMAL, MEDIUM, STRONG, VERY_STRONG
}

export enum Level {
  DEBUG, INFO, WARN, ERROR, NONE
}

function levelString() {
  return Object.keys(Level).filter(level =>
    Number.isNaN(Number.parseInt(level, 10))).join(', ');
}

const DEFAULT_LOG_LEVEL = Level.DEBUG;
const DEFAULT_MAX_DEBUG_MESSAGE_LENGTH = 64;
let globalLogLevel = DEFAULT_LOG_LEVEL;

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

export interface LoggerOptions {
  maxLength?: number;
  logPrefix?: string;
  emphasis?: Emphasis;
}

export class Logger {
  public static defaultLogLevel: Level = DEFAULT_LOG_LEVEL;

  constructor(
    private label: string,
    private logLevel: Level = Logger.defaultLogLevel,
    public maxDebugMessageLength: number = DEFAULT_MAX_DEBUG_MESSAGE_LENGTH
  ) { /* */ }

  public debug(message: any, options?: Emphasis | LoggerOptions) {
    let emphasis: Emphasis;
    let maxLength: number;
    let logPrefix: string;

    if (typeof options === 'number') {
      emphasis = <Emphasis>options;
    } else if (options) {
      emphasis = options.emphasis;
      maxLength = options.maxLength;
      logPrefix = options.logPrefix;
    }
    maxLength = typeof maxLength === 'number' ? maxLength : this.maxDebugMessageLength;

    this.logInternal(message, emphasis, Level.DEBUG, maxLength, logPrefix);
  }

  public info(message: any, emphasis = Emphasis.NORMAL) {
    this.logInternal(message, emphasis, Level.INFO);
  }

  public warn(message: any, emphasis = Emphasis.MEDIUM) {
    this.logInternal(message, emphasis, Level.WARN);
  }

  public error(message: any, emphasis = Emphasis.STRONG) {
    this.logInternal(message, emphasis, Level.ERROR);
  }

  private logInternal(
    message: any, emphasis: Emphasis = Emphasis.DEFAULT, level: Level,
    maxLength = MSG_LEN_UNLIMITED, logPrefix?: string
  ) {
    if (level >= this.getActualLogLevel()) {
      let stringMessage = this.stringify(message, maxLength);
      let fullMessage = this.generatePrefix(level, logPrefix) + stringMessage;
      let logMessage = this.colorMessage(fullMessage, emphasis);
      /* tslint:disable:no-console */
      console.log(logMessage);
      /* tslint:enable:no-console */
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
        return chalk.bgRed.black(fullMessage).toString();
    }
  }

  private generatePrefix(level: Level, logPrefix = ''): string {
    logPrefix = logPrefix ? `${logPrefix} ` : '';
    return `${Level[level]} [${new Date().toISOString()} #${process.pid}] ${this.label} --- ${logPrefix}`;
  }

  private getActualLogLevel(): Level {
    return Math.max(globalLogLevel, this.logLevel);
  }
}
