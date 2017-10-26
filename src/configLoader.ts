/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import {getLogger} from './gsLogger';
import {schemaFactory} from './yamlExtensions';

const EXECUTION_ENVIRONMENT = 'EXECUTION_ENVIRONMENT';
const ENVIRONMENTS = 'ENVIRONMENTS';

const DEFAULT_EXECUTION_ENVIRONMENT = 'DEVELOPMENT';

let logger = getLogger('config-loader');

export class ConfigLoader {
  public static viewEnvironments(fileName: string): any {
    return Object.keys(ConfigLoader.loadConfig(fileName)[ENVIRONMENTS] || {});
  }

  private static loadConfig(fileName: string, baseName = ''): any {
    return ConfigLoader.loadConfigRaw(fs.readFileSync(fileName, 'utf-8'), baseName);
  }

  private static loadConfigRaw(yamlString: string, baseName = '') {
    return yaml.safeLoad(yamlString, { schema: schemaFactory(baseName) });
  }

  constructor(private executionEnvironment?: string, private basePath = '') {
    this.executionEnvironment = this.getExecutionEnvironmentFromEnv(executionEnvironment);
    if (basePath && !basePath.endsWith(path.sep)) {
      basePath += path.sep;
    } else {
      basePath = '';
    }
    logger.debug(`ConfigLoader EXECUTION_ENVIRONMENT: ${this.executionEnvironment} basePath ${this.basePath}`);
  }

  public loadConfig(fileName: string): any {
    let parsedYaml = ConfigLoader.loadConfig(`${this.basePath}${fileName}`, path.dirname(`${this.basePath}${fileName}`));
    return this.applyEnvironment(parsedYaml);
  }

  public loadConfigRaw(yamlString: string) {
    let parsedYaml = ConfigLoader.loadConfigRaw(yamlString);
    return this.applyEnvironment(parsedYaml);
  }

  private applyEnvironment(config = {}): any {
    let allEnvironments = config[ENVIRONMENTS] || {};
    let thisEnvironment = this.matchEnvironments(allEnvironments);

    delete config[ENVIRONMENTS];

    Object.assign(config, thisEnvironment);
    return config;
  }

  private getExecutionEnvironmentFromEnv(initialExecutionEnvironment): string {
    let executionEnvironment;
    let envString: string;
    if (initialExecutionEnvironment) {
      executionEnvironment = initialExecutionEnvironment;
      envString = String(executionEnvironment);
    } else {
      envString = process.env[EXECUTION_ENVIRONMENT];
      envString = envString ? envString.toUpperCase() : DEFAULT_EXECUTION_ENVIRONMENT;
    }
    return envString;
  }

  private matchEnvironments<T>(allEnvironments: T): T {
    if (allEnvironments[this.executionEnvironment]) {
      return allEnvironments[this.executionEnvironment];
    }
    let possibleEnvironmentKeys = Object.keys(allEnvironments).filter(e => /\*$/.test(e));
    let curEnv = possibleEnvironmentKeys.find(env => this.generateEnvironmentExpression(env).test(this.executionEnvironment));
    return allEnvironments[curEnv] || {};
  }

  private generateEnvironmentExpression(env: string): RegExp {
    return new RegExp(env.replace(/[.]?\*$/, '.*'));
  }
}

let defaultConfigLoader = new ConfigLoader();
export function loadConfig(fileName: string): any {
  return defaultConfigLoader.loadConfig(fileName);
}

export function loadConfigRaw(yamlString: string) {
  return defaultConfigLoader.loadConfigRaw(yamlString);
}
