/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as yaml from 'js-yaml';
import * as fs from 'fs';

const EXECUTION_ENVIRONMENT = 'EXECUTION_ENVIRONMENT';
const ENVIRONMENTS = 'ENVIRONMENTS';

export enum ExecutionEnvironment {
  DEVELOPMENT = 1,
  STAGING,
  PRODUCTION,
  TESTING
}

export class ConfigLoader {

  constructor(private executionEnvironment?: ExecutionEnvironment, private basePath = '') {
    this.executionEnvironment = this.getExecutionEnvironmentFromEnv(executionEnvironment);
    if (basePath && !basePath.endsWith('/')) {
      basePath += '/';
    } else {
      basePath = '';
    }
  }

  public loadConfig(fileName: string): any {
    return this.applyEnvironment(yaml.safeLoad(fs.readFileSync(`${this.basePath}${fileName}`, 'utf-8')));
  }

  private applyEnvironment(config: any): any {
    let allEnvironments = config[ENVIRONMENTS] || {};
    let thisEnvironment = allEnvironments[ExecutionEnvironment[this.executionEnvironment]] || {};

    delete config[ENVIRONMENTS];

    Object.assign(config, thisEnvironment);
    return config;
  }

  private getExecutionEnvironmentFromEnv(initialExecutionEnvironment): ExecutionEnvironment {
    let executionEnvironment: ExecutionEnvironment;
    let envString: string;
    if (initialExecutionEnvironment) {
      executionEnvironment = initialExecutionEnvironment;
      envString = String(executionEnvironment);
    } else {
      envString = process.env[EXECUTION_ENVIRONMENT];
      envString = envString ? envString.toUpperCase() : 'DEVELOPMENT';
      executionEnvironment = ExecutionEnvironment[envString];
    }
    if (!executionEnvironment || !ExecutionEnvironment[executionEnvironment]) {
      throw new Error(`Invalid execution environment: ${envString}`);
    }
    return executionEnvironment;
  }
}

let defaultConfigLoader = new ConfigLoader();
export function loadConfig(fileName: string): any {
  return defaultConfigLoader.loadConfig(fileName);
}
