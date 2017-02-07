/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import * as nodeunit from 'nodeunit';
import * as math from '../src/math';

function delta(a: number, b: number): number {
  return Math.abs(a - b);
}

function isDelta(a: number, b: number, d = 1e-4): boolean {
  return delta(a, b) <= d;
}

module.exports = {
  testTpdf(test: nodeunit.Test) {
    test.ok(isDelta(math.tpdf(0), 0.39894));
    test.ok(isDelta(math.tpdf(1), 0.24197));
    test.ok(isDelta(math.tpdf(0.5, 10), 0.33970), `${math.tpdf(0.5, 10)}`);
    test.strictEqual(math.tpdf(-2, 0), math.tpdf(2, 0));
    test.done();
  },

  testTinv(test: nodeunit.Test) {
    test.strictEqual(math.tinv(0.5), 0);
    test.strictEqual(math.tinv(0.5, 1), 0);
    test.ok(isDelta(math.tinv(0.841345, 0), 1));
    test.ok(isDelta(math.tinv(0.841345), 1));
    test.ok(isDelta(math.tinv(0.829554, 10), 1));
    test.done();
  },

  testTcdf(test: nodeunit.Test) {
    test.strictEqual(math.tcdf(0), 0.5);
    test.strictEqual(math.tcdf(0, 1), 0.5);
    test.ok(isDelta(math.tcdf(1, 0), 0.841345));
    test.ok(isDelta(math.tcdf(1), 0.841345));
    test.ok(isDelta(math.tcdf(1, 10), 0.829554));
    test.done();
  }
};
