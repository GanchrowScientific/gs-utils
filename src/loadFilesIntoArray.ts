/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as fs from 'fs';

export function loadFilesIntoArray(path: string, type?: RegExp): string[] {
  return fs.readdirSync(path).reduce((array, file) => {
    if (!type || type.test(file)) {
      array.push(fs.readFileSync(`${path}/${file}`, 'utf-8'));
    }
    return array;
  }, []);
}
