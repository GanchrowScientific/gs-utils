/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as redis from 'redis';

import {isObject, dup} from './utilities';
import {isRemoteHost} from './hostName';

interface BasicRedisConfig {
  host: string;
  port: number;
  path?: string;
}

export let install = () => {
  let createClient = redis.createClient.bind(redis);
  Object.defineProperty(redis, 'createClient', {
    value: (config: BasicRedisConfig, ...args: any[]) => {
      if (isObject(config)) {
        let redisConfig = dup(config);
        if (redisConfig.path) {
          if (isRemoteHost(redisConfig.host)) {
            delete redisConfig.path;
          } else {
            delete redisConfig.port;
            delete redisConfig.host;
          }
        }
        return createClient(redisConfig, ...args);
      }
      return createClient(config, ...args);
    }
  });
  install = () => { /**/ };
};
