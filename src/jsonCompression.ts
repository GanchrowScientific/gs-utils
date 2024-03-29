/* Copyright © 2021 Ganchrow Scientific, SA all rights reserved */

import * as jsonpack from 'jsonpack/main';
import * as lzstring from 'lz-string';

export function compress(payload: Record<any, any>): string {
  const compressedJson = jsonpack.pack(payload);
  return lzstring.compressToBase64(compressedJson);
}

export function uncompress(compressed: string): Record<any, any> {
  const compressedString = lzstring.decompressFromBase64(compressed);
  return jsonpack.unpack(compressedString);
}
