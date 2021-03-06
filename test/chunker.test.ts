/* Copyright © 2016-2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import {Chunker} from '../src/chunker';

describe('Chunker', () => {
  it('should chunk things', () => {
    let c = new Chunker();
    let a = [];
    let f = function(x) {
      a.push(x);
    };

    c.forEachCompleteChunk('1\n2', f);
    c.forEachCompleteChunk('3\n4\n', f);
    c.forEachCompleteChunk('5', f);
    c.forEachCompleteChunk('6', f);
    c.forEachCompleteChunk('\n', f);
    c.forEachCompleteChunk('7\n', f);
    c.forEachCompleteChunk('\n', f);
    expect(a.toString()).toEqual(['1', '23', '4', '56', '7', ''].toString());
  });
});
