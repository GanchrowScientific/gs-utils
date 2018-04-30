/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

import {expect as jasmineExpect} from 'jasmine-core';

export class JasmineExpectation {
  constructor(private expect: jasmineExpect, private jasmineDone?: Function) { /**/ }
  public ok(val, ...args: any[]) {
    this.expect(val).toBeTruthy();
  }

  public deepEqual(a, b, ...args: any[]) {
    this.expect(a).toEqual(b);
  }

  public notDeepEqual(a, b, ...args: any[]) {
    this.expect(a).not.toEqual(b);
  }

  public strictEqual(a, b, ...args: any[]) {
    this.expect(a).toBe(b);
  }

  public throws(a, b?, ...args: any[]) {
    if (b) {
      this.expect(a).toThrow(b);
    } else {
      this.expect(a).toThrow();
    }
  }

  public doesNotThrow(a, b?, ...args: any[]) {
    if (b) {
      this.expect(a).not.toThrow(b);
    } else {
      this.expect(a).not.toThrow();
    }
  }

  public done() {
    if (this.jasmineDone) {
      this.jasmineDone();
    }
  }
}

export interface BasicTests  {
  [prop: string]: (test: JasmineExpectation) => void;
}

export interface BasicTestsSetup {
  setUp?: (cb?: Function) => void;
  tearDown?: (cb?: Function) => void;
}

export const testWrapper = {
  init(expect: jasmineExpect): JasmineExpectation {
    return new JasmineExpectation(expect);
  },
  run(module: BasicTests & BasicTestsSetup, expect: jasmineExpect, desc = 'Test') {
    describe(desc, () => {
      let ctx: any = {};
      if (module.setUp) {
        beforeEach(done => {
          module.setUp.call(ctx, done);
        });
      }

      Object.keys(module).filter(prop => prop.startsWith('test')).forEach(prop => {
        let func = module[prop];
        it(`should ${prop}`, done => {
          let test = new JasmineExpectation(expect, done);
          func.call(ctx, test);
        });
      });

      if (module.tearDown) {
        afterEach(done => {
          module.tearDown.call(ctx, done);
        });
      }
    });
  }
};
