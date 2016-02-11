/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>

// include this line in all test files to fix stack traces
import 'source-map-support/register';

import {classify, S_CLASSIFY} from '../../src/decorators/classify';

const ID_VAL = '271828';
const FIRST_NAME_VAL = 'Leonhard';
const LAST_NAME_VAL = 'Euler';
const FUNC_VAL = 'Gamma';

let clTarget: ClassifyTarget;
let clFuncTarget: ClassifyFuncTarget;

module.exports = {
  setUp(callback) {
    clTarget = new ClassifyTarget();
    clFuncTarget = new ClassifyFuncTarget();
    callback();
  },

  testClassify(test: nodeunit.Test) {
    test.equals(clTarget[S_CLASSIFY], [ID_VAL, LAST_NAME_VAL].join(':'));
    test.equals(clFuncTarget[S_CLASSIFY], [ID_VAL, LAST_NAME_VAL, FUNC_VAL].join(':'));
    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

@classify('id', 'last_name')
class ClassifyTarget {
  get id() {
    return ID_VAL;
  }

  get first_name() {
    return FIRST_NAME_VAL;
  }

  get last_name() {
    return LAST_NAME_VAL;
  }
}

@classify('id', 'last_name', 'someFunc')
class ClassifyFuncTarget {
  get id() {
    return ID_VAL;
  }

  get first_name() {
    return FIRST_NAME_VAL;
  }

  get last_name() {
    return LAST_NAME_VAL;
  }

  public someFunc(): string {
    return FUNC_VAL;
  }
}
