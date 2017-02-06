/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

/* tslint:disable no-require-imports */
const math = require('../build/Release/normaldist');
/* tslint:enable no-require-imports */

export function tinv(prob: number, dof?: number): number {
  return math.tinv(prob, dof);
}

export function tcdf(z: number, dof?: number): number {
  return math.tcdf(z, dof);
}

export function stdNorm(z: number): number {
  return math.stdNorm(z);
}
