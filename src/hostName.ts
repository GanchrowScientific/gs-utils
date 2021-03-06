/* Copyright © 2016-2021 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as os from 'os';
import * as dnsSync from 'dns-sync';

export function getNetworkIP(): string {
  try {
    return getNetworkIPs()[0];
  } catch (e) {
    // assume network is turned off
    return '';
  }
}

export function getNetworkIPs(): string[] {
  try {
    let ifaces = os.networkInterfaces();
    return Object.keys(ifaces)
      .map(i => ifaces[i]
      .filter(x => x.family === 'IPv4' && !x.internal)[0])
      .filter(f => !!f)
      .map(iface => iface.address);
  } catch (e) {
    // assume network is turned off
    return [''];
  }
}

function isExactMatchWrap(item: any): (otherItem: any) => boolean {
  return (otherItem: string) => item === otherItem;
}

function possibleLocalHostNames(): any[] {
  return ['localhost', '127.0.0.1', os.hostname(), ...getNetworkIPs()];
}

export function isRemoteHost(host: any): boolean {
  return !(!host || possibleLocalHostNames().some(isExactMatchWrap(host)));
}

export function isLocalHost(host: string): boolean {
  const ip = dnsSync.resolve(host);
  return ip ? possibleLocalHostNames().some(isExactMatchWrap(ip)) :
    !isRemoteHost(host);
}
