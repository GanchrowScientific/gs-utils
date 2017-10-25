/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

export async function delay(num = 1) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, num * 1000);
  });
}
