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
    let invoker = new Invoker(scripts[name], name, client, retryMs);
    let bound = invoker.invoke.bind(invoker);
    bound[SHA_SYMBOL] = invoker.sha;
    scriptInvokers[name] = bound;
  });
  return new Proxy(scriptInvokers, {
    get: (target, name) => {
      if (name in target) {
        return target[name];
      }
      if (commandExists(name)) {
        return ( { args = [] }) => {
          return wrapAsync(client[name].bind(client), ...args);
        };
      }
    }
  });
}

class Invoker {
  public sha: string;

  constructor(private contents: string, public name: string, private client: redis.RedisClient, private retryMs = DEFAULT_RETRY_MS) {
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

  private async attemptRetry(err: Error, { keys = [], args = [] } = {}) {
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

  private async loadScript() {
    return new Promise((resolve, reject) => {
      this.client.script('LOAD', this.contents, async (err: Error, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  private isMissingScriptError(err: Error) {
    return /NOSCRIPT/.test(err.message);
  }

  private isBusyWaitingError(err: Error) {
    return /BUSY/.test(err.message);
  }
}
