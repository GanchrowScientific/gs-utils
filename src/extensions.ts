/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';
/// <reference path="../../typings/node/node.d.ts"/>

Object.defineProperties(Array.prototype, {
  compact: {
    value: function() {
      return this.filter(item => item !== undefined);
    }
  }
});

Object.defineProperties(Object, {
  values: {
    value: function(obj: Object) {
      return Object.keys(obj).map((k) => obj[k]);
    },
    configurable: true
  }
});

interface Array<T> {
  compact: () => Array<T>;
}

interface ObjectConstructor {
  values: <T>({}) => Array<T>;
}
