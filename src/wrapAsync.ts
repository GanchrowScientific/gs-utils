/* Copyright © 2017-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function wrapAsync<T>(func: Function, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    func(...(args.concat((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })));
  });
}
