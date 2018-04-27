/* Copyright © 2015-2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import {testWrapper} from '../../src/jasmineTestWrapper';

import {precondition} from '../../src/decorators/precondition';

const test = testWrapper.init(expect);

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

describe('@precondition', () => {
  beforeEach(() => {
    this.store = new Datastore();
  });

  it('should test precondition and throw', () => {
    test.throws(() =>
      this.store.storeValue(null, 'hucairz'));
    test.throws(() =>
      this.store.storeValue(undefined, 'hucairz'));
    test.throws(() =>
      this.store.storeValue('', 'hucairz'));
    test.throws(() =>
      this.store.storeValue('hucairz', null));
    test.throws(() =>
      this.store.storeValue('hucairz', undefined), new Error([
        'Function storeValue failed its precondition with args: [hucairz,].',
        'Reason: Value must be defined'
      ].join('\n'))
    );

    test.doesNotThrow(() =>
      this.store.storeValue('key', 1));
  });

  it('should test precondition and throw (2)', () => {
    this.store.storeValue('key', 1);

    test.strictEqual(1, this.store.getValue('key'));

    test.throws(() =>
      this.store.getValue('hucairz'), new Error([
        'Function getValue failed its precondition with args: [hucairz].',
        'Reason: Key does not exist in datastore'
      ].join('\n'))
    );

  });
});
