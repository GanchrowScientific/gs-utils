/* Copyright © 2024 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import { testWrapper, JasmineExpectation } from '../src/jasmineTestWrapper';

import { hashifyOnNewLine } from '../src/hashifyOnNewLine';

const MODULE = {
  setUp(callback) {
    callback();
  },

  testHashifyOnNewLine(test: JasmineExpectation) {
    test.deepEqual(hashifyOnNewLine('ishohiofhioa'), {});
    test.deepEqual(hashifyOnNewLine('ishohiofhioa,1'), {});
    test.deepEqual(hashifyOnNewLine('ishohiofhioa,1\nfoo,bar'), {});
    test.deepEqual(
      hashifyOnNewLine('ishohiofhioa,1\nfoo,bar', 2),
      { ishohiofhioa: '1', foo: 'bar' }
    );
    test.deepEqual(
      hashifyOnNewLine('ishohiofhioa,1\nfoo,bar', 1),
      {}
    );
    test.deepEqual(
      hashifyOnNewLine([
        [
          'm', 'p', 'this is a thing'
        ],
        [
          'm', 'p1', 'this is another thing'
        ],
        [
          'm', 'p2', 'this is yet another thing'
        ],
        [
          'm1', 'p', 'this is an m1 thing'
        ],
        [
          'm1', 'p1', 'this is another m1 thing'
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing'
        ]
      ].map((x) => x.join(',')).join('\n'), 3),
      {
        m: {
          p: 'this is a thing',
          p1: 'this is another thing',
          p2: 'this is yet another thing'
        },
        m1: {
          p: 'this is an m1 thing',
          p1: 'this is another m1 thing',
          p2: 'this is yet another m1 thing'
        }
      }
    );
    test.deepEqual(
      hashifyOnNewLine([
        [
          'm', 'p', 'this is a thing', 1
        ],
        [
          'm', 'p1', 'this is another thing', 2
        ],
        [
          'm', 'p2', 'this is yet another thing', 3
        ],
        [
          'm1', 'p', 'this is an m1 thing', 4
        ],
        [
          'm1', 'p1', 'this is another m1 thing', 5
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing', 6
        ]
      ].map((x) => x.join(',')).join('\n'), 3),
      {}
    );
    test.deepEqual(
      hashifyOnNewLine([
        [
          'm', 'p', 'this is a thing', 1
        ],
        [
          'm', 'p1', 'this is another thing', 2
        ],
        [
          'm', 'p2', 'this is yet another thing', 3
        ],
        [
          'm1', 'p', 'this is an m1 thing', 4
        ],
        [
          'm1', 'p1', 'this is another m1 thing', 5
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing', 6
        ],
        [
          'm1', 'p', 'this is an m1 thing but different', 7
        ],
        [
          'm1', 'p1', 'this is another m1 thing but different', 8
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing but different', 9
        ]
      ].map((x) => x.join(',')).join('\n'), 4),
      {
        m1: {
          p: {
            'this is an m1 thing but different': '7',
            'this is an m1 thing': '4'
          },
          p1: {
            'this is another m1 thing but different': '8',
            'this is another m1 thing': '5'
          },
          p2: {
            'this is yet another m1 thing but different': '9',
            'this is yet another m1 thing': '6'
          }
        },
        m: {
          p: {
            'this is a thing': '1'
          },
          p1: {
            'this is another thing': '2'
          },
          p2: {
            'this is yet another thing': '3'
          }
        }
      }
    );
    test.deepEqual(
      hashifyOnNewLine([
        [
          'm', 'p', 'this is a thing', 1
        ],
        [
          'm', 'p1', 'this is another thing', 2
        ],
        [
          'm', 'p2', 'this is yet another thing', 3
        ],
        [
          'm1', 'p', 'this is an m1 thing', 4
        ],
        [
          'm1', 'p1', 'this is another m1 thing', 5
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing', 6
        ],
        [
          'm1', 'p', 'this is an m1 thing but different', 7
        ],
        [
          'm1', 'p1', 'this is another m1 thing but different', 8
        ],
        [
          'm1', 'p2', 'this is yet another m1 thing but different', 9
        ]
      ].map((x) => x.join(',')).join('\n'), 4, (x, i) => i === 3 ? +x : (i === 2 ? x.toUpperCase() : x)),
      {
        m1: {
          p: {
            'THIS IS AN M1 THING BUT DIFFERENT': 7,
            'THIS IS AN M1 THING': 4
          },
          p1: {
            'THIS IS ANOTHER M1 THING BUT DIFFERENT': 8,
            'THIS IS ANOTHER M1 THING': 5
          },
          p2: {
            'THIS IS YET ANOTHER M1 THING BUT DIFFERENT': 9,
            'THIS IS YET ANOTHER M1 THING': 6
          }
        },
        m: {
          p: {
            'THIS IS A THING': 1
          },
          p1: {
            'THIS IS ANOTHER THING': 2
          },
          p2: {
            'THIS IS YET ANOTHER THING': 3
          }
        }
      }
    );
    test.done();
  },

  tearDown(callback) {
    callback();
  }
};

testWrapper.run(MODULE, expect, 'hashifyOnNewLine');
