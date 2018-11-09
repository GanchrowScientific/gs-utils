/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function stringFormat(str: string, replace: any[]): string {
  let i = 0;
  return str.replace(/%s/g, () => (replace[i++] || ''));
}
