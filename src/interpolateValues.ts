/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */

import { deepKeyValue } from './deepKeyValue';

const MATCH_DELIMITERS = { WORDS: /\{(.*?)\}/g , REPLACE: /\{|\}/g };

export function interpolateValues(
  text: string,
  values: Record<string, any>,
  regexToMatchValues: RegExp = MATCH_DELIMITERS.WORDS,
  regexToMatchDelimiters: RegExp = MATCH_DELIMITERS.REPLACE
): string {
  let wordsToInterpolate = text.match(regexToMatchValues);
  if (wordsToInterpolate) {
    let replacers = wordsToInterpolate.map(r => new RegExp(r, 'g'));
    return replacers.reduce((txt, replacer) => {
      return txt.replace(replacer, (wordToInterpolate) => {
        let key = wordToInterpolate.replace(regexToMatchDelimiters, '');
        let value = deepKeyValue(values, key);
        if (value === undefined ) {
          throw 'The key was not found or is undefined';
        }
        return value;
      });
    }, text);
  }
  return text;
}


