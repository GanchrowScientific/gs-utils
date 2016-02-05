#!/bin/bash
cat <<EOF
/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/nodeunit/nodeunit.d.ts"/>

// include this line to fix stack traces
import 'source-map-support/register';

import * as sinon from 'sinon';
import * as pq from 'proxyquire';
let proxyquire = pq.noPreserveCache();

module.exports = {
  setUp: function(callback) {
    callback();
  },

  test: function(test: nodeunit.Test) {
    test.done();
  },

  tearDown: function(callback) {
    callback();
  }
};

function createMocks() {
}
EOF
