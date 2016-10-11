/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import {PrivateEventEmitter} from './privateEventEmitter';
import {isJSON} from './utilities';

const KEYS_COMMAND = 'keys';

export interface RedisMulti {
  lrange: Function;
  exec: Function;
}

export interface Subscribable {
}

export interface RedisMultiable {
  duplicate(): RedisMultiable;
  multi(): RedisMulti;
  mget(keys: string[], cb: Function): void;
  keys(pattern: string, cb: Function): void;
  subscribe(pattern: string, cb?: Function): void;
  psubscribe(pattern: string, cb?: Function): void;
  on(type: string, cb: Function): void;
}

export interface RedisMultiConfigOptions {
  [sig: string]: any;
  persist?: string;
}

export class RedisMultiConfig extends PrivateEventEmitter {
  private isPersisted: boolean;
  private config: RedisMultiConfigOptions;
  private keyRequests = {};

  constructor(private client: RedisMultiable) {
    super();
  }

  public load(config?: RedisMultiConfigOptions, tsig?: string) {
    let multi = this.client.multi();
    if (!this.isPersisted && config && config.persist) {
      this.createPersistence(config.persist);
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
            this.keys(multi, args[0], sig);
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

  public subscribe(ch: string, cb: Function) {
    let subscriptionClient = this.client.duplicate();
    subscriptionClient.on('message', (channel, message) => {
      if (channel === ch) {
        cb(message, channel);
      }
    });
    subscriptionClient.subscribe(ch);
  }

  public psubscribe(ch: string, cb: Function) {
    let subscriptionClient = this.client.duplicate();
    subscriptionClient.on('pmessage', (pattern, channel, message) => {
      cb(message, pattern, channel);
    });
    subscriptionClient.psubscribe(ch);
  }

  private createPersistence(persistChannel: string) {
    let subscriptionClient = this.client.duplicate();
    this.isPersisted = true;
    this.once('done', (...args: any[]) => {
      subscriptionClient.on('message', (channel, message) => {
        if (channel === persistChannel) {
          this.load(null, message);
        }
      });
      subscriptionClient.subscribe(persistChannel);
    });
  }

  private exec(multi: RedisMulti, sigs: string[]) {
    multi.exec((err, res) => {
      if (err) {
        this.emit('error', err);
      } else {
        let finishedObject = {};
        let keyRequests = Object.keys(this.keyRequests);
        sigs.filter(t => !keyRequests.includes(t)).forEach((s, i) => {
          finishedObject[s] = this.deepParse(res[i]);
        });
        if (keyRequests.length) {
          this.resolveKeyRequests(finishedObject);
        } else {
          this.emit('done', finishedObject);
        }
      }
    });
  }

  private resolveKeyRequests(finishedObject: Object) {
    let keyRequests = Object.keys(this.keyRequests);
    let len = keyRequests.length;
    let count = 0;
    Object.keys(this.keyRequests).forEach(sig => {
      let keys = this.keyRequests[sig];
      this.client.mget(keys, (err, res) => {
        if (err) {
          this.emit('eachError', ['keys', sig], err);
        } else {
          let innerObject = {};
          keys.forEach((key, i) => {
            if (res[i]) {
              innerObject[key] = this.deepParse(res[i]);
            }
          });
          finishedObject[sig] = innerObject;
          count++;
          if (count === len) {
            this.emit('done', finishedObject);
          }
        }
      });
    });
    this.keyRequests = {};
  }

  private lrange(multi: RedisMulti, key: string) {
    multi.lrange(key, 0, -1, this.eachCallback.bind(this, key));
  }

  private keys(multi: RedisMulti, pattern: string, sig: string) {
    this.client.keys(pattern, (err, res) => {
      if (err) {
        this.emit('eachError', ['keys', pattern], err);
      } else {
        this.emit('each', ['keys', pattern], res);
        this.keyRequests[sig] = res;
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
  }
}

class SigNotFound extends Error {
  constructor(message: string) {
    super();
    this.name = 'SigNotFound';
    this.message = message;
  }
}
