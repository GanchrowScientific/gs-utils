/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

import 'jasmine';

import { ordinal } from '../src/ordinal';

describe('between', () => {
  it ('should calculate the correct ordinal', () => {
    expect(ordinal(1)).toBe('1st');
    expect(ordinal(21)).toBe('21st');
    expect(ordinal(2)).toBe('2nd');
    expect(ordinal(102)).toBe('102nd');
    expect(ordinal(3)).toBe('3rd');
    expect(ordinal(33)).toBe('33rd');
    expect(ordinal(4)).toBe('4th');
    expect(ordinal(54)).toBe('54th');
    expect(ordinal(5)).toBe('5th');
    expect(ordinal(25)).toBe('25th');
    expect(ordinal(15)).toBe('15th');
    expect(ordinal(16)).toBe('16th');
    expect(ordinal(12)).toBe('12th');
    expect(ordinal(112)).toBe('112th');
    expect(ordinal(511)).toBe('511th');
    expect(ordinal(513)).toBe('513th');
    expect(ordinal('hey')).toBe('hey');
    expect(ordinal(0)).toBe(0);
  });
});
