/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';
import {lowercaseArguments} from '../../src/decorators/lowercaseArguments';

module.exports = {
  setUp(callback) {
    callback();
  },

  testStringArgumentsAreLowerCased: function(test: nodeunit.Test) {
    let mock = new Mock(test);
    mock.testStringMethod('Hey', 'bRo');
  },

  testNoModifyNonStringArgs: function(test: nodeunit.Test) {
    let mock = new Mock(test);
    mock.testNoModificationsMethod(1, [1, 2], ['foo', 'bar']);
  },

  testInvalidDecoratorAssignment: function(test: nodeunit.Test) {
    test.throws(() => {
      class ShouldThrow {

        @lowercaseArguments
        get bad() {
          return true;
        }
      };
      return new ShouldThrow();
    });
    test.done();
  },

  testNoArgumentsDoesNothing: function(test: nodeunit.Test) {
    let mock = new Mock(test);
    mock.testNoArguments();
  },

  tearDown(callback) {
    callback();
  }
};

class Mock {

  constructor(private test: nodeunit.Test) { /**/ }


  @lowercaseArguments
  public testStringMethod(a: string, b: string) {
    this.test.strictEqual(a, a.toLowerCase());
    this.test.strictEqual(b, b.toLowerCase());
    this.test.done();
  }

  @lowercaseArguments
  public testNoModificationsMethod(a: number, b: number[], c: string[]) {
    this.test.strictEqual(a, a);
    this.test.deepEqual(b, b);
    this.test.deepEqual(c, c);
    this.test.done();
  }

  @lowercaseArguments
  public testNoArguments() {
    this.test.strictEqual(arguments.length, 0);
    this.test.done();
  }

}
