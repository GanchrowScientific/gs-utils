/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (arg?: T) => void;
  reject: (err: Error) => void;
}

export function defer<T>(): Deferred<T> {
  let deferredResult: any = {};
  deferredResult.promise = new Promise((resolve, reject) => {
    deferredResult.resolve = resolve;
    deferredResult.reject = reject;
  }) as Promise<T>;
  return deferredResult as Deferred<T>;
}

