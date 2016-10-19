/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import {PrivateEventEmitter} from './privateEventEmitter';
import {isObject} from './utilities';

const LUA_COMMANDS: any = {};
LUA_COMMANDS.isJson = `
  local function isJson(value)
    return type(value) == 'string' and
      (string.sub(value, 1, 1) == '{' or string.sub(value, 1, 1) == '[')
  end
`;
LUA_COMMANDS.zipHash = `
  local function zipHash(keys, values)
    local result = {}
    for i, key in ipairs(keys) do
      local value = values[i]
      if isJson(value) then
        result[key] = cjson.decode(value)
      end
    end
    return result
  end
`;

LUA_COMMANDS.commandTable = `
  local commandTable = {
    loadKeys = {
      execute = function(arg, partial)
        partial = partial or {}
        local keys = redis.call('keys', arg)
        if #keys > 0 then
          for key, field in pairs(zipHash(keys, redis.call('mget', unpack(keys)))) do
            partial[key] = field
          end
        end
        return partial
      end
    },
    loadArray = {
      execute = function(arg, partial)
        partial = partial or {}
        for _, item in ipairs(redis.call('lrange', arg, 0, -1)) do
          if (isJson(item)) then
            item = cjson.decode(item)
          end
          table.insert(partial, tonumber(item) or item)
        end
        return partial
      end
    },
    loadHash = {
      execute = function(arg, partial)
        partial = partial or {}
        local keys = redis.call('hkeys', arg)
        if #keys > 0 then
          for key, field in pairs(zipHash(keys, redis.call('hmget', arg, unpack(keys)))) do
            partial[key] = field
          end
        end
        return partial
      end
    }
  }
`;

LUA_COMMANDS.generate = `
  local function generate(configObject)
    local resultObject = {}
    for code, items in pairs(configObject) do
      if type(items) == 'table' then
        local partialResults = resultObject[code]
        for cmd, args in pairs(items) do
          local cmdExec = commandTable[cmd]
          if not cmdExec then
            break
          end
          if not partialResults then
            partialResults = {}
            resultObject[code] = partialResults
          end
          for _, arg in ipairs(args) do
            cmdExec.execute(arg, partialResults)
          end
        end
      end
    end
    return resultObject
  end
`;

LUA_COMMANDS.main = `
  return cjson.encode(generate(cjson.decode(ARGV[1])))
`;

const LUA_EVAL = Object.keys(LUA_COMMANDS).map(cmd => LUA_COMMANDS[cmd]).join('');
const LUA_ALLOWED_COMMANDS = ['loadHash', 'loadArray', 'loadKeys'];

export interface RedisAtomicClientConfiguration {
  [sig: string]: any;
  persist?: string;
}

export interface RedisAtomicClient {
  duplicate(): RedisAtomicClient;
  eval(script: string, numArgs: number, arg: any, cb?: Function);
  subscribe(pattern: string, cb?: Function): void;
  psubscribe(pattern: string, cb?: Function): void;
  on(type: string, cb: Function): void;
}

export class RedisAtomicDataLoader extends PrivateEventEmitter {
  private isPersisted: boolean;

  public static configurationValidator(config: Object) {
    return Object.keys(config).filter(key => {
      if (isObject(config[key]) &&
           Object.keys(config[key]).length &&
           Object.keys(config[key]).every(item => LUA_ALLOWED_COMMANDS.includes(item))
         ) {
        return false;
      }
      return true;
    });
  }

  constructor(private client: RedisAtomicClient, private config: RedisAtomicClientConfiguration) {
    super();
    this.createPersistence(config.persist);
    delete config.persist;
  }

  public load(partialKey?: string) {
    let partialConfig = partialKey ? { [partialKey]: this.config[partialKey] } : this.config;
    if (partialKey && !partialConfig[partialKey]) {
      this.emit('error', new Error(`Invalid config key ${partialKey}`));
      return;
    }
    this.client.eval(LUA_EVAL, 0, JSON.stringify(partialConfig), (err, res) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('done', JSON.parse(res));
      }
    });
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
    if (!persistChannel) {
      return;
    }
    let subscriptionClient = this.client.duplicate();
    this.isPersisted = true;
    this.once('done', (...args: any[]) => {
      subscriptionClient.on('message', (channel, message: string) => {
        if (channel === persistChannel) {
          this.load(message);
        }
      });
      subscriptionClient.subscribe(persistChannel);
    });
  }
}
