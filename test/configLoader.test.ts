/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';
import * as yaml from 'js-yaml';

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

  testLoadConfigRaw(test: nodeunit.Test) {
    let data = {
      foo: 'bar', baz: [1, 2, 3],
      ENVIRONMENTS: {
        DEVELOPMENT: {
          foo: 'baz'
        },
        TESTING: {
          baz: [2, 3, 4]
        }
      }
    };
    let loader = new ConfigLoader('TESTING');
    let config = loader.loadConfigRaw(yaml.dump(data));
    test.deepEqual(config, {
      foo: 'bar', baz: [2, 3, 4]
    });
    loader = new ConfigLoader();
    config = loader.loadConfigRaw(yaml.dump(data));
    test.deepEqual(config, {
      foo: 'baz', baz: [1, 2, 3]
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

  testLoadExtensionsRange(test: nodeunit.Test) {
    let loader = new ConfigLoader();
    test.deepEqual(
      loader.loadConfig(getCompletePath('configWithRangeExtension')),
      {
        key1: 'hey',
        key2: {
          range: [1, 3, 5, 7, 9],
          range2: [21, 17, 13, 9, 5],
          range3: [],
          range4: [-9, -8, -7, -6, -5, -4, -3, -2, -1],
          range5: []
        },
        key3: {
          range: [11, 5, -1, -7, -13],
          range2: [3, 5, 7],
          range3: []
        },
        key4: {
          range: [ 18.234, 18.484, 18.734, 18.984, 19.234, 19.484, 19.734, 19.984 ]
        },
        key5: {
          range: []
        }
      }
    );
    test.done();
  },

  testLoadExtensionsBadRange(test: nodeunit.Test) {
    let loader = new ConfigLoader();
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionNull')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionString')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionObject')));
    test.done();
  },

  testLoadExtensionsPath(test: nodeunit.Test) {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithPathExtension')), {
      path1: `${__dirname}/resources/here`,
      path2: `${__dirname}/resources/here/there`,
      path3: `${__dirname}/resources/here/there/`,
      path4: `${__dirname}/resources/`,
      path5: `${__dirname}/resources/with/an/unprintable/\\u003B/char/`
    });
    test.done();
  },

  testLoadExtensionsBadPath(test: nodeunit.Test) {
    let loader = new ConfigLoader();
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadPathExtension')));
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
