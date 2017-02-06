/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as yaml from 'js-yaml';
import * as fs from 'fs';
import {getLogger} from './gsLogger';

const EXECUTION_ENVIRONMENT = 'EXECUTION_ENVIRONMENT';
const ENVIRONMENTS = 'ENVIRONMENTS';

const DEFAULT_EXECUTION_ENVIRONMENT = 'DEVELOPMENT';

let logger = getLogger('config-loader');

export class ConfigLoader {
  public static viewEnvironments(fileName: string): any {
    return Object.keys(yaml.safeLoad(fs.readFileSync(fileName, 'utf-8'))[ENVIRONMENTS] || {});
  }

  constructor(private executionEnvironment?: string, private basePath = '') {
    this.executionEnvironment = this.getExecutionEnvironmentFromEnv(executionEnvironment);
    if (basePath && !basePath.endsWith('/')) {
      basePath += '/';
    } else {
      basePath = '';
    }
    logger.debug(`ConfigLoader EXECUTION_ENVIRONMENT: ${this.executionEnvironment} basePath ${this.basePath}`);
  }

  public loadConfig(fileName: string): any {
    return this.applyEnvironment(yaml.safeLoad(fs.readFileSync(`${this.basePath}${fileName}`, 'utf-8')));
  }

  private applyEnvironment(config = {}): any {
    let allEnvironments = config[ENVIRONMENTS] || {};
    let thisEnvironment = allEnvironments[this.executionEnvironment] || {};

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
}

let defaultConfigLoader = new ConfigLoader();
export function loadConfig(fileName: string): any {
  return defaultConfigLoader.loadConfig(fileName);
}