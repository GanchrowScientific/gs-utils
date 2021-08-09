/* Copyright © 2021 Ganchrow Scientific, SA all rights reserved */

// include this line to fix stack traces
import 'source-map-support/register';
import { bigPayload } from './payloads/bigPayload';

import 'jasmine';

import { compress, uncompress } from '../../src/jsonCompression';

describe('jsonCompression', () => {

  it('should compress a given js object and return the same object after uncrompression', async () => {
    const compressed = compress(bigPayload);
    expect(bigPayload).toEqual(uncompress(compressed) as any);
  });
});
