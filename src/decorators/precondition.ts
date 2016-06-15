/* Copyright © 2015-2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

export function precondition(message: string, condition: (...args: any[]) => boolean) {
  return (target: Object, key: string, method: TypedPropertyDescriptor<any>) => {
    return {
      value: function(...args: any[]) {
        if (!condition.apply(this, args)) {
          throw new Error(`Function ${key} failed its precondition with args: [${args.toString()}].\nReason: ${message}`);
        }
        return method.value.apply(this, args);
      }
    };
  };
}
