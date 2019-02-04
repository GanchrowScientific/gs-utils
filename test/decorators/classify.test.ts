/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line in all test files to fix stack traces
import 'source-map-support/register';
import * as sinon from 'sinon';
import 'jasmine';

import {testWrapper} from '../../src/jasmineTestWrapper';
import {classify, S_CLASSIFY} from '../../src/decorators/classify';

const test = testWrapper.init(expect);

const ID_VAL = '271828';
const FIRST_NAME_VAL = 'Leonhard';
const LAST_NAME_VAL = 'Euler';
const FUNC_VAL = 'Gamma';

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


@classify('id', 'last_name')
class ClassifyTargetWithEmpty {
  get id() {
    return ID_VAL;
  }

  get first_name() {
    return FIRST_NAME_VAL;
  }

  get last_name() {
    return null;
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

/* tslint:disable no-console */
describe('@classify', () => {
  beforeEach(() => {
    this.clTarget = new ClassifyTarget();
    this.clFuncTarget = new ClassifyFuncTarget();
    this.clTargetEmpty = new ClassifyTargetWithEmpty();
    this.originalLog = console.log;
    console.log = sinon.spy();
  });

  afterEach(() => {
    console.log = this.originalLog;
  });

  it('should classify', () => {
    test.strictEqual(this.clTarget[S_CLASSIFY], [ID_VAL, LAST_NAME_VAL].join(':'));
    test.strictEqual(this.clFuncTarget[S_CLASSIFY], [ID_VAL, LAST_NAME_VAL, FUNC_VAL].join(':'));
  });

  it('should handle missing key', () => {
    delete this.clTarget.first_name;
    test.strictEqual(this.clTargetEmpty[S_CLASSIFY], '271828:<MISSING>');
    test.strictEqual((<sinon.SinonSpy>console.log).callCount, 1);
    test.ok((<sinon.SinonSpy>console.log).firstCall.args[0].indexOf('Cannot create classifier for key: last_name in object: {}') > 0);
  });
});
/* tslint:enable no-console */
