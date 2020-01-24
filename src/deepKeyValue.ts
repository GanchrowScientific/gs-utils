/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */

export function deepKeyValue(values: Record<string, any>, key: string, defaultValue?: any): any {
  let path = key.split('.');
  let value;
  try {
    value = path.reduce((acc, val) => acc[val], values);
  } catch (e) {
    return defaultValue;
  }
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}


