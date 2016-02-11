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
    test.equals(bar.bar, 'bar');
    test.ok(!('foobar' in bar));
    test.equals(bar.shabaz, 5);
    test.equals(bar.shabazMethod(), 10);
    test.equals(bar.poofMethod(), 'poof up in the air');
    test.done();
  },

  testBarIncludeMethodOverride(test: nodeunit.Test) {
    let bar = createBar();
    test.equals(bar.common(), 'COMMON');
    test.done();
  },

  testFoobarInclude(test: nodeunit.Test) {
    let foobar = createFoobar();
    test.equals(foobar.foobar, 'foobar');
    test.equals(foobar.bar, 'bar');
    test.equals(foobar.shabaz, 5);
    test.equals(foobar.shabazMethod(), 10);
    test.equals(foobar.poofMethod(), 'poof up in the air');
    test.done();
  },

  testFoobarIncludeMethodOverride(test: nodeunit.Test) {
    let foobar = createFoobar();
    test.equals(foobar.common(), 'COMMON');
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
