/* Copyright © 2016-2026 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as os from 'os';
import * as dnsSync from 'dns-sync';

const MAX_HOSTNAME_LENGTH = 253;

// dns-sync@0.2.1 interpolates the hostname into an unquoted shell command, and its own
// guard regex is built from a string where "\." decays to a match-any wildcard -- so shell
// metacharacters reach the shell. Validate here (real regex literal, no string escaping)
// before handing anything to it. Everything this accepts, dns-sync also accepts.
const VALID_HOSTNAME =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

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
  return ['localhost', '127.0.0.1', os.hostname(), ...getNetworkIPs(), '::1'];
}

export function isRemoteHost(host: any): boolean {
  return !(!host || possibleLocalHostNames().some(isExactMatchWrap(host)));
}

function isValidHostName(host: any): boolean {
  return typeof host === 'string' && host.length > 0 &&
    host.length <= MAX_HOSTNAME_LENGTH && VALID_HOSTNAME.test(host);
}

export function isLocalHost(host: string): boolean {
  const ip = isValidHostName(host) ? dnsSync.resolve(host) : null;
  return ip ? possibleLocalHostNames().some(isExactMatchWrap(ip)) :
    !isRemoteHost(host);
}
