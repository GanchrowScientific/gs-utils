/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';
import 'jasmine';

import { testWrapper } from '../src/jasmineTestWrapper';

import { interpolateValues } from '../src/interpolateValues';

const test = testWrapper.init(expect);

describe('interpolateValues', () => {

  let values;

  beforeEach(() => {
    values = {
      brackets: 'delimiters',
      values: 'information',
      object: {
        details: 'object'
      }
    };
  });

  it('should interpolate text between delimiters with the information provided', () => {
    let text = 'text between {brackets} will be replaced by {values} from the provided {object.details}';
    test.strictEqual(
      interpolateValues(text, values),
      'text between delimiters will be replaced by information from the provided object'
    );
  });

  it('should throw an exception if some of the values is not found or undefined', () => {
    let text = 'text between {brackets} will be replaced by {values} from the provided {object.details}';
    values = {
      values: 'information',
      object: {
        details: 'object'
      }
    };
    test.throws(
      () => interpolateValues(text, values),
      'The key was not found or is undefined'
    );
  });

});
