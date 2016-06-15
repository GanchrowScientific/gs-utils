/* Copyright © 2015-2016 Ganchrow Scientific, SA all rights reserved */

/// <reference path="../../typings/index.d.ts" />

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import {precondition} from '../../src/decorators/precondition';

class Datastore {

  private data: {};

  constructor() {
    this.data = {};
  }

  // Must use function instead of => so that 'this' can be dynamically set
  @precondition('Key must be non-empty', function(key: string, value: any) {
    return key !== null && typeof key !== 'undefined' && key.length > 0;
  })
  @precondition('Key already exists in datastore', function(key, value) {
    return !(key in this.data);
  })
  @precondition('Value must be defined', function(key, value) {
    return value !== null && typeof value !== 'undefined';
  })
  public storeValue(key: string, value: any) {
    this.data[key] = value;
  }

  @precondition('Key does not exist in datastore', function(key, value) {
    return this.data[key];
  })
  public getValue(key: string) {
    return this.data[key];
  }
}

module.exports = {
  setUp(cb: nodeunit.ICallbackFunction) {
    this.store = new Datastore();
    cb();
  },

  testStoreValue(test: nodeunit.Test) {
    test.throws(() =>
      this.store.storeValue(null, 'hucairz'));
    test.throws(() =>
      this.store.storeValue(undefined, 'hucairz'));
    test.throws(() =>
      this.store.storeValue('', 'hucairz'));
    test.throws(() =>
      this.store.storeValue('hucairz', null));
    test.throws(() =>
      this.store.storeValue('hucairz', undefined),
`Function storeValue failed its precondition with args: [hucairz,].
Reason: Key must be non-empty`);

    test.doesNotThrow(() =>
      this.store.storeValue('key', 1));
    test.done();
  },

  testGetValue(test: nodeunit.Test) {
    this.store.storeValue('key', 1);

    test.equals(1, this.store.getValue('key'));

    test.throws(() =>
      this.store.getValue('hucairz'),
`Function storeValue failed its precondition with args: [hucairz].
Reason: Key does not exist in datastore`);

    test.done();
  }
};
