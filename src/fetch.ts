/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import {isObject} from './utilities';

export interface FetchInterface {
  values?: Object;
  defaultValue?: any;
}

/**
 * Takes a regular key => val pair object and creates a simple Fetch class to return defaultValues if not exist
 * @class Fetch
 */
export class Fetch {
  private map = new Map();
  private defaultValue: any;
  /**
   * Create a fetch instance
   * @param {FetchInterface} obj - key => val pair wrapped with fetch
   */
  constructor(obj: FetchInterface) {
    if (isObject(obj.values)) {
      Object.keys(obj.values).forEach(k => {
        this.map.set(this.tryStringLower(k), obj.values[k]);
      });
    }
    this.defaultValue = obj.defaultValue;
  }

  public fetch(k) {
    k = this.tryStringLower(k);
    if (!this.map.has(k)) {
      this.map.set(k, this.defaultValue);
    }
    return this.map.get(k);
  }

  private tryStringLower(val) {
    return typeof val === 'string' ? val.toLowerCase() : val;
  }
}

