/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { IndexQueue } from '../src/indexQueue';

describe('Queue', () => {

  it('should enqueue and dequeue in correct order', () => {
    let numberOfElements = 1000;
    let q = new IndexQueue<number>();
    expect(q.isEmpty()).toEqual(true);
    let elements = Array(numberOfElements).fill(0);
    elements.forEach((el, ix) => {
      q.enqueue(ix);
      expect(q.isEmpty()).toEqual(false);
    });
    expect(q.size()).toEqual(elements.length);
    elements.forEach((el, ix) => {
      expect(q.isEmpty()).toEqual(false);
      let element = q.dequeue();
      expect(element).toEqual(ix);
    });
    expect(q.isEmpty()).toEqual(true);
  });

});
