/* Copyright © 2025 Ganchrow Scientific, SA all rights reserved */

'use strict';

export function separateDataAndUuid(data: string): [string, string] {
  try {
    let extractedData = null;
    let uuid = null;

    // The expected format is: { "data": "...", "uuid": "..." }
    // If `data` is not in this format, return the original `data` and blank uuid.
    let obj = JSON.parse(data);

    Object.keys(obj).forEach((key) => {
      if (key === 'uuid') {
        uuid = obj[key];
      } else if (key === 'data') {
        extractedData = obj[key];
      } else {
        throw new Error(`Invalid key: ${key}`);
      }
    });

    if (!uuid || typeof uuid !== 'string' || typeof extractedData !== 'string') {
      throw new Error('Invalid data format');
    }

    return [extractedData, uuid];
  } catch (e) {
    return [data, ''];
  }
}
