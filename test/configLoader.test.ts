/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

const test = testWrapper.init(expect);

import { ConfigLoader, loadConfig } from '../src/configLoader';

import { dup } from '../src/utilities';

describe('ConfigLoader', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2018-12-17'));
  });
  afterEach(() => {
    jasmine.clock().uninstall();
    delete process.env.EXECUTION_ENVIRONMENT;
  });

  it('should view environments', () => {
    test.deepEqual(
      ConfigLoader.viewEnvironments(getCompletePath('configWithMultipleEnvironments')),
      ['DEVELOPMENT', 'STAGING']
    );
  });

  it('should view environments raw', () => {
    test.deepEqual(
      ConfigLoader.viewEnvironmentsRaw(fs.readFileSync(getCompletePath('configWithMultipleEnvironments'), 'utf-8')),
      ['DEVELOPMENT', 'STAGING']
    );
  });

  it('should load config simple', () => {
    let configSimple = loadConfig(getCompletePath('configSimple'));
    test.deepEqual(configSimple, {
      key1: [ 'value1', 'value2' ]
    });
  });

  it('should load config raw', () => {
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
  });

  it('should load config with development environment', () => {
    let configWithDevelopementEnvironment = loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value5', 'value6' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value7', 'value8' ]
    });
  });

  it('should load custom environment', () => {
    let configWithDevelopementEnvironment = new ConfigLoader().loadConfig(getCompletePath('configWithDevelopementEnvironment'));
    test.deepEqual(configWithDevelopementEnvironment, {
      key1: [ 'value5', 'value6' ],
      key2: [ 'value3', 'value4' ],
      key3: [ 'value7', 'value8' ]
    });
  });

  it('should load custom config non default environment from env variable', () => {
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
  });

  it('should load custom config overriden by class param', () => {
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
  });

  it('should laod non default config path', () => {
    let loader = new ConfigLoader('STAGING');
    let configSimple = loader.loadConfig(getCompletePath('extraPath/configSimple'));
    test.deepEqual(configSimple, {
      key1: [ 'value1', 'value2' ]
    });
  });

  it('should load empty config', () => {
    let loader = new ConfigLoader();
    let configSimple = loader.loadConfig(getCompletePath('emptyConfig'));
    test.deepEqual(configSimple, {});
  });

  it('should load config with pattern', () => {
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
  });

  it('should load range extension', () => {
    let loader = new ConfigLoader();
    test.deepEqual(
      dup(loader.loadConfig(getCompletePath('configWithRangeExtension'))),
      dup({
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
      })
    );
  });

  it('should load range extension (bad)', () => {
    let loader = new ConfigLoader();
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionNull')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionString')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadRangeExtensionObject')));
  });

  it('should load flatten extensions', () => {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithFlattenExtension')), {
      flatten1: [1, 2, 3, 4, 8],
      flatten2: [{hey: 'dog'}, {sunny: 'day'}, 'foo'],
      flatten3: [[1], 2, 3, ['foo']]
    });
    test.done();
  });

  it('should load flatten extensions (bad)', () => {
    let loader = new ConfigLoader();
    test.throws(() => loader.loadConfig(getCompletePath('configWithFlattenExtensionBadNull')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithFlattenExtensionBadObject')));
    test.throws(() => loader.loadConfig(getCompletePath('configWithFlattenExtensionBadScalar')));
    test.done();
  });

  it('should load path extension', () => {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithPathExtension')), {
      path1: `${__dirname}/resources/here`,
      path2: `${__dirname}/resources/here/there`,
      path3: `${__dirname}/resources/here/there/`,
      path4: `${__dirname}/resources/`,
      path5: `${__dirname}/resources/with/an/unprintable/\\u003B/char/`
    });
  });

  it('should load path extension (bad)', () => {
    let loader = new ConfigLoader();
    test.throws(() => loader.loadConfig(getCompletePath('configWithBadPathExtension')));
  });

  it('should load ymd extension', () => {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithYmd')), {
      key: '20181215',
      key1: '20181217', // bad config returns same date
      key2: '20181207',
      key3: '20181207',
      key4: '20181227',
      key5: Math.round( ( Date.now() - 24 * 2 * 60 * 60 * 1000 ) / 1000 ),
      key6: Math.round( ( Date.now() + 24 * 10 * 60 * 60 * 1000 ) / 1000 )
    });
  });

  it('should load fromFile extension', () => {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithFromFile')), {
      array: [1, 2, 3],
      arrayFromFile: ['hey', 'foo', 'bar'],
      defaultFromNoFile: 'default'
    });
  });

  it('should load concat extension', () => {
    let loader = new ConfigLoader();
    test.deepEqual(loader.loadConfig(getCompletePath('configWithConcat')), {
      key1: 'value1value2'
    });
  });

  it('should load randomElement extension', () => {
    let loader = new ConfigLoader();
    let loader1 = new ConfigLoader();
    let loader2 = new ConfigLoader();
    let loader3 = new ConfigLoader();
    let loader4 = new ConfigLoader();
    let loaderData = loader.loadConfig(getCompletePath('configWithRandomElement'));
    let loaderData1 = loader1.loadConfig(getCompletePath('configWithRandomElement'));
    let loaderData2 = loader2.loadConfig(getCompletePath('configWithRandomElement'));
    let loaderData3 = loader3.loadConfig(getCompletePath('configWithRandomElement'));
    let loaderData4 = loader4.loadConfig(getCompletePath('configWithRandomElement'));
    [ loaderData, loaderData1, loaderData2, loaderData3, loaderData4 ].forEach(d => {
      test.ok([1, 2, 3, 4, 5].includes(d.hey));
    });
    test.ok([ loaderData1, loaderData2, loaderData3, loaderData4 ].some(d => {
      return d.hey !== loaderData.hey;
    }));
  });

  it('should throw error when environment is missing in strict environment mode', () => {
    let loader = new ConfigLoader('NOT_MISSING_ENVIRONMENT');
    try {
      let config = loader.loadConfigRaw(yaml.dump({
        strict_environment_mode: true,
        ENVIRONMENTS: {
          NOT_MISSING_ENVIRONMENT: {
            hey: 'foo',
            foo: 5
          }
        }
      }));
      expect(config).toEqual({strict_environment_mode: true, hey: 'foo', foo: 5});
    } catch (e) {
      expect(true).toEqual(false);
    }
    loader = new ConfigLoader('MISSING_ENVIRONMENT');
    try {
      loader.loadConfigRaw(yaml.dump({
        strict_environment_mode: true,
        ENVIRONMENTS: {
          NOT_MISSING_ENVIRONMENT: {
            hey: 'foo',
            foo: 5
          }
        }
      }));
      expect(true).toEqual(false);
    } catch (e) {
      expect(e.message).toEqual('ConfigLoader: Environment MISSING_ENVIRONMENT not defined');
    }

  });

});

function getCompletePath(file: string): string {
  return `${__dirname}/resources/${file}.yaml`;
}
