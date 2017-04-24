/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import * as nodeunit from 'nodeunit';

import * as oddNumberPatternExpander from '../src/oddNumberPatternExpander';


module.exports = {
  testExpand(test: nodeunit.Test) {
    test.deepEqual(oddNumberPatternExpander.expand(null), []);
    test.deepEqual(oddNumberPatternExpander.expand(''), []);
    test.deepEqual(oddNumberPatternExpander.expand('hucairz'), []);
    test.deepEqual(oddNumberPatternExpander.expand('1.2.3'), [1, 3]);
    test.deepEqual(oddNumberPatternExpander.expand('1.'), [1]);
    test.deepEqual(oddNumberPatternExpander.expand('.1'), [1]);
    test.deepEqual(oddNumberPatternExpander.expand('-1'), [1]);

    test.deepEqual(oddNumberPatternExpander.expand('1'), [1]);
    test.deepEqual(oddNumberPatternExpander.expand('0'), [1]);
    test.deepEqual(oddNumberPatternExpander.expand('4'), [3]);

    test.deepEqual(oddNumberPatternExpander.expand('1.5'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('1-5'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('5-1'), [1, 3, 5]);

    test.deepEqual(oddNumberPatternExpander.expand('5----1'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('5...1'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('5.--.1'), [1, 3, 5]);


    test.deepEqual(oddNumberPatternExpander.expand('4-8'), [3, 5, 7]);
    test.deepEqual(oddNumberPatternExpander.expand('8-4'), [3, 5, 7]);
    test.deepEqual(oddNumberPatternExpander.expand('0-0'), [1]);

    test.deepEqual(oddNumberPatternExpander.expand('1.4  6'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('1.6  4'), [1, 3, 5]);
    test.deepEqual(oddNumberPatternExpander.expand('1.6  4-10'), [1, 3, 5, 7, 9]);
    test.deepEqual(oddNumberPatternExpander.expand('-1.6  4-10'), [1, 3, 5, 7, 9]);
    test.deepEqual(oddNumberPatternExpander.expand('-1.6  4-10'), [1, 3, 5, 7, 9]);
    test.deepEqual(oddNumberPatternExpander.expand('-10.12'), [9, 11]);
    test.deepEqual(oddNumberPatternExpander.expand('-10.-13'), [9, 11, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('99 103 21-25 23'), [21, 23, 25, 99, 103]);

    test.deepEqual(oddNumberPatternExpander.expand('10   . -    13'), [9, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('10   .-    13'), [9, 11, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('10   xxxx.-    13'), [9, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('   10   xxxx.-    13xxx'), [9, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('1-   10   xxxx.-    13xxx'), [1, 3, 5, 7, 9, 13]);
    test.deepEqual(oddNumberPatternExpander.expand('1.5.9.13'), [1, 3, 5, 9, 11, 13]);
    test.done();
  }
};
