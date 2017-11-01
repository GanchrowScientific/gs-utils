/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as redis from 'redis';
import * as shasum from 'shasum';
import {exists as commandExists} from 'redis-commands';
import {wrapAsync} from './wrapAsync';

const DEFAULT_RETRY_MS = 1000;
export const SHA_SYMBOL = Symbol('sha');

export type ScriptInvoker = (luaArgs?: { keys?: string[], args?: any[] }) => Promise<any>;

export type RegisteredScripts = Record<string, ScriptInvoker>;

export function registerScripts(
  client: redis.RedisClient,
  scripts: Record<string, string>,
  retryMs?: number
): RegisteredScripts {

  let scriptInvokers = {};
  Object.keys(scripts).forEach(name => {
    let invoker = new ShaInvoker(scripts[name], name, client, retryMs);
    let bound = invoker.invoke.bind(invoker);
    bound[SHA_SYMBOL] = invoker.sha;
    scriptInvokers[name] = bound;
  });
  return new Proxy(scriptInvokers, {
    get: (target, name) => {
      if (name in target) {
        return target[name];
      } else if (typeof name === 'string' && commandExists(name)) {
        let invoker = new CommandInvoker(name, client, retryMs);
        return target[name] = invoker.invoke.bind(invoker);
      } else {
        return client[name];
      }
    }
  });
}

abstract class Invoker {

  constructor(protected client: redis.RedisClient, private retryMs = DEFAULT_RETRY_MS) { /**/ }

  public abstract invoke({ keys, args }): Promise<any>;

  protected async attemptRetry(err: Error, { keys = [], args = [] } = {}) {
    if (this.isMissingScriptError(err)) {
      await this.loadScript();
      return await this.invoke({ keys, args });
    } else if (this.isBusyWaitingError(err)) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.invoke({ keys, args }));
        }, this.retryMs);
      });
    } else {
      throw err;
    }
  }

  protected async loadScript() {
    /**/
  }

  protected isMissingScriptError(err: Error) {
    return /NOSCRIPT/.test(err.message);
  }

  private isBusyWaitingError(err: Error) {
    return /BUSY/.test(err.message);
  }

}

class ShaInvoker extends Invoker {
  public sha: string;

  constructor(private contents: string, public name: string, client: redis.RedisClient, retryMs: number) {
    super(client, retryMs);
    this.sha = shasum(contents);
  }

  public invoke({ keys = [], args = [] } = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.evalsha(this.sha, keys.length, ...keys.concat(args), async (err: Error, res) => {
        try {
          if (err) {
            res = await this.attemptRetry(err, { keys, args });
          }
          resolve(res);

        } catch (e) {
          reject(e);
        }
      });
    });
  }

  protected async loadScript() {
    return wrapAsync(this.client.script.bind(this.client, 'LOAD', this.contents));
  }
}

class CommandInvoker extends Invoker {

  constructor(public name: string, client: redis.RedisClient, retryMs: number) {
    super(client, retryMs);
  }

  public invoke({ args = [] } = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client[this.name](...args, async (err: Error, res) => {
        try {
          if (err) {
            res = await this.attemptRetry(err, { args });
          }
          resolve(res);

        } catch (e) {
          reject(e);
        }
      });
    });
  }

  protected isMissingScriptError(err: Error) {
    return false;
  }

}
