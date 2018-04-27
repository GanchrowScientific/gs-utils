/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import {testWrapper, JasmineExpectation} from '../../src/jasmineTestWrapper';
import {lowercaseArguments} from '../../src/decorators/lowercaseArguments';

const jasmineTest = testWrapper.init(expect);

class Mock {

  constructor(private test: JasmineExpectation) { /**/ }


  @lowercaseArguments
  public testStringMethod(a: string, b: string) {
    this.test.strictEqual(a, a.toLowerCase());
    this.test.strictEqual(b, b.toLowerCase());
  }

  @lowercaseArguments
  public testNoModificationsMethod(a: number, b: number[], c: string[]) {
    this.test.strictEqual(a, a);
    this.test.deepEqual(b, b);
    this.test.deepEqual(c, c);
  }

  @lowercaseArguments
  public testNoArguments() {
    this.test.strictEqual(arguments.length, 0);
  }

}

describe('@lowercaseArguments', () => {
  it('should lowercase string arguments', () => {
    let mock = new Mock(jasmineTest);
    mock.testStringMethod('Hey', 'bRo');
  });

  it('should not modify non string arguments', () => {
    let mock = new Mock(jasmineTest);
    mock.testNoModificationsMethod(1, [1, 2], ['foo', 'bar']);
  });

  it('should throw invalid decorator', () => {
    jasmineTest.throws(() => {
      class ShouldThrow {

        @lowercaseArguments
        get bad() {
          return true;
        }
      }
      return new ShouldThrow();
    });
  });

  it('should do nothing with no arguments', () => {
    let mock = new Mock(jasmineTest);
    mock.testNoArguments();
  });
});

