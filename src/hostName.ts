/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as os from 'os';
import * as ph from 'parse-hosts';

export function getNetworkIP(): string {
  try {
    let ifaces = os.networkInterfaces();
    return Object.keys(ifaces)
      .map(i => ifaces[i].filter(x => x.family === 'IPv4' && !x.internal)[0])
      .filter(f => !!f)[0].address;
  } catch (e) {
    // assume network is turned off
    return '';
  }
}

function isExactMatchWrap(item: any): (otherItem: any) => boolean {
  return (otherItem: string) => item === otherItem;
}

function possibleLocalHostNames(): any[] {
  return ['localhost', '127.0.0.1', os.hostname(), getNetworkIP()].concat((ph.get() || {})['127.0.0.1']);
}

export function isRemoteHost(host: any): boolean {
  return !(!host || possibleLocalHostNames().some(isExactMatchWrap(host)));
}
