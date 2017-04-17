/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';

import {ConfigLoader, loadConfig} from '../src/configLoader';

module.exports = {
  testViewEnvironments(test: nodeunit.Test) {
    test.deepEqual(
      ConfigLoader.viewEnvironments(getCompletePath('configWithMultipleEnvironments')),
      ['DEVELOPMENT', 'STAGING']
    );
    test.done();
  },


  testLoadConfigSimple(test: nodeunit.Test) {
    let configSimple = loadConfig(getCompletePath('configSimple'));
    test.deepEqual(configSimple, {
      key1: [ 'value1', 'value2' ]
    });
    test.done();
  },

  testLoadConfigWithDevelopmentEnvironment(test: nodeunit.Test) {
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

  testLoadEmptyConfig(test: nodeunit.Test) {
    let loader = new ConfigLoader();
    let configSimple = loader.loadConfig(getCompletePath('emptyConfig'));
    test.deepEqual(configSimple, {});
    test.done();
  },

  testLoadConfigPattern(test: nodeunit.Test) {
    let loader = new ConfigLoader('PRODUCTION_TEST');
    let configPatterns = loader.loadConfig(getCompletePath('configPatterns'));
    test.deepEqual(configPatterns, {
      key1: ['value1', 'value2'],
      key2: ['value2', 'value3'],
      keyString: 'string',
      keyNumber: 0
    });

    ['PRODUCTION_TEST1', 'PRODUCTION', 'PRODUCTION_'].forEach(env => {
      loader = new ConfigLoader(env);
      configPatterns = loader.loadConfig(getCompletePath('configPatterns'));
      test.deepEqual(configPatterns, {
        key1: ['value1', 'value2'],
        key3: ['value10', 'value11'],
        keyNumber: 1
      });
    });

    ['DEVELOPMENT', 'PRODUCTIO', null].forEach(env => {
      loader = new ConfigLoader(env);
      configPatterns = loader.loadConfig(getCompletePath('configPatterns'));
      test.deepEqual(configPatterns, {
        key1: ['value1', 'value2']
      });
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
