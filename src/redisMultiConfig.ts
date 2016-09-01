/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import {PrivateEventEmitter} from './privateEventEmitter';
import {isJSON} from './utilities';

const KEYS_COMMAND = 'keys';

export interface RedisMulti {
  mget: Function;
  lrange: Function;
  exec: Function;
}

export interface RedisMultiable {
  multi(): RedisMulti;
  keys(pattern: string, cb: Function): void;
  subscribe(pattern: string, cb?: Function): void;
  on(type: string, cb: Function): void;
}

export interface RedisMultiConfigOptions {
  [sig: string]: any;
  persist?: string;
}

export class RedisMultiConfig extends PrivateEventEmitter {
  private isPersisted: boolean;
  private config: RedisMultiConfigOptions;

  constructor(private client: RedisMultiable) {
    super();
  }

  public load(config?: RedisMultiConfigOptions, tsig?: string) {
    let multi = this.client.multi();
    if (!this.isPersisted && config && config.persist) {
      this.persist(config.persist);
      delete config.persist;
    }
    if (config) {
      this.config = config;
    }
    let sigs = tsig ? [tsig] : Object.keys(this.config);
    sigs.forEach(sig => {
      let innerConfig = this.config[sig];
      if (innerConfig) {
        if (Array.isArray(innerConfig)) {
          let cmd = innerConfig[0];
          let args = innerConfig.slice(1);
          if (cmd === KEYS_COMMAND) {
            this.keys(multi, args[0]);
          } else {
            this.try(multi, cmd, ...args);
          }
        } else {
          this.lrange(multi, innerConfig);
        }
      } else {
        this.emit('configError', new SigNotFound(sig));
      }
    });
    this.exec(multi, sigs);
  }

  private persist(persistChannel: string) {
    this.isPersisted = true;
    this.once('done', (...args: any[]) => {
      this.client.on('message', (channel, message) => {
        if (channel === persistChannel) {
          this.load(null, message);
        }
      });
      this.client.subscribe(persistChannel);
    });
  }

  private exec(multi: RedisMulti, sigs: string[]) {
    multi.exec((err, res) => {
      if (err) {
        this.emit('error', err);
      } else {
        let finishedObject = {};
        res.forEach((r, i) => {
          finishedObject[sigs[i]] = this.deepParse(r);
        });
        this.emit('done', finishedObject);
      }
    });
  }

  private lrange(multi: RedisMulti, key: string) {
    multi.lrange(key, 0, -1, this.eachCallback.bind(this, key));
  }

  private keys(multi: RedisMulti, pattern: string) {
    this.client.keys(pattern, (err, res) => {
      if (err) {
        this.emit('eachError', 'keys', err);
      } else {
        multi.mget(...res, this.eachCallback.bind(this, 'keys'));
      }
    });
  }

  private try(multi: RedisMulti, cmd: string, ...args: any[]) {
    if (typeof multi[cmd] === 'function') {
      multi[cmd](...args, this.eachCallback.bind(this, args));
    } else {
      this.emit('eachError', args, new InvalidRedisCommand(cmd));
    }
  }

  private eachCallback(item: any, err: any, res: any) {
    if (err) {
      this.emit('eachError', item, err);
    } else {
      this.emit('each', item, res);
    }
  }

  private eachParse(val: any): any {
    return (typeof val === 'string') && isJSON(val) ? JSON.parse(val) : val;
  }

  private deepParse(val: any): any {
    if (Array.isArray(val)) {
      return val.map(this.eachParse);
    } else {
      return this.eachParse(val);
    }
  }
}

class InvalidRedisCommand extends Error {
  constructor(message: string) {
    super();
    this.name = 'InvalidRedisCommand';
    this.message = message;
    this.stack = (new Error()).stack;
  }
}

class SigNotFound extends Error {
  constructor(message: string) {
    super();
    this.name = 'SigNotFound';
    this.message = message;
    this.stack = (new Error()).stack;
  }
}
