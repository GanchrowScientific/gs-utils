/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function lowercaseArguments(taget: any, propertyName: string, descriptor?: TypedPropertyDescriptor<any>) {
  if (descriptor && typeof descriptor.value === 'function') {
    let oldfunc = descriptor.value;
    descriptor.value = function() {
      return oldfunc.apply(this, Array.prototype.map.call(arguments, (val) => {
        return (typeof val === 'string' ? val.toLowerCase() : val);
      }));
    };
  } else {
    throw new Error('Not a valid descriptor for lowercaseArguments decorator');
  }
}
