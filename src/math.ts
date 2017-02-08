/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

/* tslint:disable no-require-imports */
const dist = require('../build/Release/prob_distributions');
/* tslint:enable no-require-imports */

export function tinv(prob: number, dof?: number): number {
  return dist.tinv(prob, dof);
}

export function tcdf(z: number, dof?: number): number {
  return dist.tcdf(z, dof);
}

export function tpdf(z: number, dof?: number): number {
  return dist.tpdf(z, dof);
}

export function erf(x: number): number {
  return dist.erf(x);
}
