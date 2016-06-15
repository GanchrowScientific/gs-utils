/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';

export class Rule extends Lint.Rules.AbstractRule {

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let options = this.getOptions();
    let copyrightString: string = options.ruleArguments[0];
    let startYear = Number(options.ruleArguments[1]);
    let endYear = new Date().getFullYear();
    let possibleYears: number[] = [];
    for (let year = startYear; year <= endYear; year++) {
      possibleYears.push(year);
    }
    let possibleYearPotentialRanges = possibleYears.map(y => y.toString());
    possibleYears.forEach((year, idx) => {
      possibleYears.forEach((nextYear, nextIdx) => {
        if (nextIdx !== idx) {
          possibleYearPotentialRanges.push(`${Math.min(year, nextYear)}-${Math.max(year, nextYear)}`);
        }
      });
    });
    let copyrightInFile = sourceFile.text.split('\n')[0];
    if (!this.hasPotentialRangeAndIsCopyright(copyrightString, copyrightInFile, possibleYearPotentialRanges)) {
      return [new Lint.RuleFailure(sourceFile, 0, copyrightInFile.length,
        this.generateFailureString(copyrightString, possibleYearPotentialRanges), 'copyright-check')];
    }
    return [];
  }

  private generateFailureString(copyright: string, yearRanges: string[]) {
    return 'Invalid copyright string. Copyright should start at first character of file and be:\n' +
      `${copyright.replace(/%%%/, '[YEAR RANGE]')} where [YEAR RANGE] is one of:\n${JSON.stringify(yearRanges)}`;
  }

  private hasPotentialRangeAndIsCopyright(copyrightString, copyright, possibleYearPotentialRanges): boolean {
    return possibleYearPotentialRanges.some(yearRange => {
      return copyright === copyrightString.replace(/%%%/, yearRange);
    });
  }
}
