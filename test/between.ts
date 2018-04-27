/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */

'use strict';

import 'jasmine';

import {between} from '../src/between';

describe('between', () => {
  it('should be between', () => {
    expect(between(2, 1, 3)).toBe(true);
    expect(!between(2, 2, 3)).toBe(true);
    expect(!between(3, 2, 3)).toBe(true);
    [50, 500, 5000, 50000].forEach(n => {
      let iterations = 100;
      while (iterations--) {
        expect(between(Math.random() * n + n, n, n * 2)).toBe(true);
      }
    });
  });
});
