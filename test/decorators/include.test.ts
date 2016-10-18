/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import {include} from '../../src/decorators/include';

module.exports = {
  setUp(callback) {
    callback();
  },

  testBarInclude(test: nodeunit.Test) {
    let bar = createBar();
    test.strictEqual(bar.bar, 'bar');
    test.ok(!('foobar' in bar));
    test.strictEqual(bar.shabaz, 5);
    test.strictEqual(bar.shabazMethod(), 10);
    test.strictEqual(bar.poofMethod(), 'poof up in the air');
    test.done();
  },

  testBarIncludeMethodOverride(test: nodeunit.Test) {
    let bar = createBar();
    test.strictEqual(bar.common(), 'COMMON');
    test.done();
  },

  testFoobarInclude(test: nodeunit.Test) {
    let foobar = createFoobar();
    test.strictEqual(foobar.foobar, 'foobar');
    test.strictEqual(foobar.bar, 'bar');
    test.strictEqual(foobar.shabaz, 5);
    test.strictEqual(foobar.shabazMethod(), 10);
    test.strictEqual(foobar.poofMethod(), 'poof up in the air');
    test.done();
  },

  testFoobarIncludeMethodOverride(test: nodeunit.Test) {
    let foobar = createFoobar();
    test.strictEqual(foobar.common(), 'COMMON');
    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

function createBar() {
  return new Bar();
}

function createFoobar() {
  return new Foobar();
}

class Shabaz {
  get shabaz() { return 5; }
  get common() { return 5; }
  public shabazMethod() {
    return 10;
  }
}

class Poof {
  public poofMethod() {
    return 'poof up in the air';
  }

  public common() {
    return 'COMMON';
  }
}

@include(Shabaz, Poof)
class Bar {
  public common;
  public shabaz;
  get bar() {
    return 'bar';
  }
  public shabazMethod() {
    /**/
  }
  public poofMethod() {
    /**/
  }
}

@include(Bar)
class Foobar {
  public bar;
  public shabaz;
  get foobar() {
    return 'foobar';
  }
  public common() {
    return 'ONCOMMON';
  }

  public shabazMethod() {
    /**/
  }
  public poofMethod() {
    /**/
  }
}
