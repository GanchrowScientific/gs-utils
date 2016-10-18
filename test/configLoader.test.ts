/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import {ConfigLoader, loadConfig} from '../src/configLoader';

module.exports = {
  testLoadConfigSimple: function(test: nodeunit.Test) {
    let configSimple = loadConfig(getCompletePath('configSimple'));
    test.deepEqual(configSimple, {
      key1: [ 'value1', 'value2' ]
    });
    test.done();
  },

  testLoadConfigWithDevelopmentEnvironment: function(test: nodeunit.Test) {
    let configWithDevelopementEnvironment = loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value5', 'value6' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value7', 'value8' ]
    });
    test.done();
  },

  testCustomConfigDefaultEnvironment(test: nodeunit.Test) {
    let configWithDevelopementEnvironment = new ConfigLoader().loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value5', 'value6' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value7', 'value8' ]
    });
    test.done();
  },

  testCustomConfigNonDefaultEnvironmentFromEnvironmentVariable(test: nodeunit.Test) {
    process.env.EXECUTION_ENVIRONMENT = 'STAGING';
    let loader = new ConfigLoader();
    let configWithDevelopementEnvironment = loader.loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    // STAGING doesn't exist, so no change from default
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value1', 'value2' ],
      key2: [ 'value3', 'value4' ]
    });
    let configWithMultipleEnvironments = loader.loadConfig(getCompletePath('configWithMultipleEnvironments'));
    test.deepEqual(configWithMultipleEnvironments, {
      key1: [ 'value9', 'value10' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value11', 'value12' ]
    });
    test.done();
  },

  testCustomConfigOverriddenByClassParameter(test: nodeunit.Test) {
    process.env.EXECUTION_ENVIRONMENT = 'PRODUCTION';
    let loader = new ConfigLoader('STAGING');
    test.strictEqual((<any> loader).executionEnvironment, 'STAGING');
    let configWithDevelopementEnvironment = loader.loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    // STAGING doesn't exist, so no change from default
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value1', 'value2' ],
      key2: [ 'value3', 'value4' ]
    });
    let configWithMultipleEnvironments = loader.loadConfig(getCompletePath('configWithMultipleEnvironments'));
    test.deepEqual(configWithMultipleEnvironments, {
      key1: [ 'value9', 'value10' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value11', 'value12' ]
    });
    test.done();
  },

  testNonDefaultConfigPath(test: nodeunit.Test) {
    let loader = new ConfigLoader('STAGING');
    let configSimple = loader.loadConfig(getCompletePath('extraPath/configSimple'));
    test.deepEqual(configSimple, {
      key1: [ 'value1', 'value2' ]
    });
    test.done();
  },

  tearDown(cb) {
    delete process.env.EXECUTION_ENVIRONMENT;
    cb();
  }
};

function getCompletePath(file: string): string {
  return `${__dirname}/resources/${file}.yaml`;
}
