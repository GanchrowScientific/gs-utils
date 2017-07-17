/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function wrapAsync(func: Function, ...args: any[]): Promise<any> {
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
