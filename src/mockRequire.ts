/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function mockClass(kls: any, props: string[]) {
  if (kls && kls.prototype) {
    props.forEach(prop => {
      Object.defineProperty(kls.prototype, prop, {
        value: function() { /**/ }, configurable: false
      });
    });
  }
}

export function mockRequireClass(file: string, kls: string, props: string[]) {
  let obj;
  try {
    obj = require(file); // tslint:disable-line
    mockClass(obj[kls], props);
  } catch (e) {
    throw e;
  }
}
