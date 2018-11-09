/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import {stringFormat} from '../src/stringFormat';

describe('stringFormat', () => {
  it('should replace %s with args', () => {
    expect(stringFormat('%s this is %s and very %s', [1, 2])).toBe('1 this is 2 and very ');
    expect(stringFormat('%s this is %s and very %s', [1, 2, 3])).toBe('1 this is 2 and very 3');
    expect(stringFormat('%s this is %s and very %s', [1])).toBe('1 this is  and very ');
    expect(stringFormat('%s this is %s and very %s', [])).toBe(' this is  and very ');
  });
});

