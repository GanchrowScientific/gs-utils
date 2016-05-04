/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>

// include this line in all test files to fix stack traces
import 'source-map-support/register';
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
    this.test.equals(a, a.toLowerCase());
    this.test.equals(b, b.toLowerCase());
    this.test.done();
  }

  @lowercaseArguments
  public testNoModificationsMethod(a: number, b: number[], c: string[]) {
    this.test.equals(a, a);
    this.test.deepEqual(b, b);
    this.test.deepEqual(c, c);
    this.test.done();
  }

  @lowercaseArguments
  public testNoArguments() {
    this.test.equals(arguments.length, 0);
    this.test.done();
  }

}
