/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function setOnce(target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<any>) {
  if (descriptor) {
    let defaultValue = descriptor.value;
    delete descriptor.value;
    delete descriptor.writable;
    descriptor.set = function <T>(value: T): void {
      let newDescriptor: TypedPropertyDescriptor<T> = {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        value: value
      };
      Object.defineProperty(this, propertyName, newDescriptor);
    };
    descriptor.get = descriptor.get || function() { return defaultValue; };
  } else {
    Object.defineProperty(
      target,
      propertyName, {
        configurable: true,
        enumerable: true,
        set: function <T>(value: T): void {
          let newDescriptor: TypedPropertyDescriptor<T> = {
            enumerable: true,
            value: value
          };
          Object.defineProperty(this, propertyName, newDescriptor);
        }
      }
    );
  }
}
