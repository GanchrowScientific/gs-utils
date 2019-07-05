/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import stripControlChars from '../src/stripControlChars';

describe('stripControlChars', () => {
  it('should stripControlChars', () => {
    // degenerate cases
    expect(stripControlChars('')).toBe('');
    expect(stripControlChars('\n\t ')).toBe('');
    expect(stripControlChars(null)).toBe(null);
    expect(stripControlChars(undefined)).toBe(undefined);
    expect(stripControlChars(1 as any)).toBe(1 as any);
    expect(stripControlChars(false as any)).toBe(false as any);

    // happy path
    expect(stripControlChars('abc')).toBe('abc');
    expect(stripControlChars('\nabc\t ')).toBe('abc');
    expect(stripControlChars('\nab c\t ')).toBe('ab c');
    expect(stripControlChars('\nab~c\t ')).toBe('ab~c');
    expect(stripControlChars('ab\u0009c')).toBe('ab\u0009c');

    // complexities arise
    expect(stripControlChars('\na\r\nbc\t ')).toBe('a\nbc');
    expect(stripControlChars('ab\u001Fc')).toBe('abc');
    expect(stripControlChars('ab\u009Fc')).toBe('abc');
    expect(stripControlChars('ab\u00A0c\u00A0')).toBe('ab\u00A0c'); // non-breaking space
  });
});
