/* Copyright © 2018 Ganchrow Scientific, SA all rights reserved */
'use strict';

export function identityProxy() {
  return new Proxy({}, { get(target, key) { return key; } } );
}
