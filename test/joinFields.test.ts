/* Copyright © 2019 Ganchrow Scientific, SA all rights reserved */
'use strict';

import 'source-map-support/register';
import 'jasmine';

import { joinFields } from '../src/joinFields';

describe('joinFields', () => {
  it('should join fields', () => {
    expect(
      joinFields((new Array(10)).fill(0).map((_, idx) => ({ val: idx, foo: `foo${idx}` } )), 3)
    ).toEqual(
      [
        {
          val: '0,1,2', foo: 'foo0,foo1,foo2'
        },
        {
          val: '3,4,5', foo: 'foo3,foo4,foo5'
        },
        {
          val: '6,7,8', foo: 'foo6,foo7,foo8'
        },
        {
          val: 9, foo: 'foo9'
        }
      ]
    );
    expect(
      joinFields((new Array(1)).fill(0).map((_, idx) => ({ val: idx, foo: `foo${idx}` } )), 3)
    ).toEqual(
      [
        {
          val: 0, foo: 'foo0'
        }
      ]
    );
  });
});
