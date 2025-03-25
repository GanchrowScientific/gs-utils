/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */

'use strict';

const MAX_EVENTS = 500;

export const numbersPattern = /([0-9]+)(\s*[.-]+\s*([0-9]+))?/g;

/**
 * Expands a string of odd numbers separated by periods or spaces
 * into a series of odd numbers. See the tests for examples.
 *
 * @param  {string}   numbersString the pattern of numbers to expand
 * @return {number[]}               the expanded set of numbers
 */
export function expand(numbersString: string, maxEvents: number = MAX_EVENTS): number[] {
  if (!numbersString) {
    return [];
  }
  numbersPattern.lastIndex = 0;
  let matches: Set<number> = new Set();
  let lastMatch;
  try {
    do {
      lastMatch = matchIteration(numbersString);
      lastMatch.forEach(id => matches.add(id));
    } while (lastMatch.length);
  } catch (e) {
    if (e instanceof RangeError) {
      console.error('Caught RangeError, size: ', matches.size,
        'numbersString: ', numbersString, 'message: ', e.message
      );
    } else {
      console.error('Caught', e.message, 'numbersString: ', numbersString,
        'size: ', matches.size
      );
    }
  }
  numbersPattern.lastIndex = 0;
  return Array.from(matches).sort((x, y) => x - y).slice(0, maxEvents);
}

function matchIteration(numbersString: string): number[] {
  let match = numbersPattern.exec(numbersString);
  if (!match) {
    return [];
  }
  let firstNum = Number(match[1]);
  let secondNum = Number(match[3]) || firstNum;
  if (Number.isNaN(firstNum) || Number.isNaN(secondNum)) {
    return [];
  }

  if (firstNum > secondNum) {
    [secondNum, firstNum] = [firstNum, secondNum];
  }

  if (firstNum === 0) {
    firstNum = 1;
  } else if (isEven(firstNum)) {
    firstNum -= 1;
  }

  if (secondNum === 0) {
    secondNum = 1;
  } else if (isEven(secondNum)) {
    secondNum -= 1;
  }

  let matches = [];
  for (let i = firstNum; i <= secondNum; i += 2) {
    matches.push(i);
  }

  return matches;
}

function isEven(num: number): boolean {
  return num % 2 === 0;
}
