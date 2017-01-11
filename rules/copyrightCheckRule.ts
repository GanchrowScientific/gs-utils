/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new CheckCopyrightWalker(sourceFile, this.getOptions()));
  }
}

class CheckCopyrightWalker extends Lint.RuleWalker {
  constructor(node: ts.SourceFile, private opts: Lint.IOptions) {
    super(node, opts);
  }

  public visitSourceFile(node: ts.SourceFile) {
    let options = this.opts;
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
    let copyrightInFile = node.text.split('\n')[0];
    if (!this.hasPotentialRangeAndIsCopyright(copyrightString, copyrightInFile, possibleYearPotentialRanges)) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(),
        this.generateFailureString(copyrightString, possibleYearPotentialRanges)));
    }
    super.visitSourceFile(node);
  }

  private hasPotentialRangeAndIsCopyright(copyrightString, copyright, possibleYearPotentialRanges): boolean {
    return possibleYearPotentialRanges.some(yearRange => {
      return copyright === copyrightString.replace(/%%%/, yearRange);
    });
  }

  private generateFailureString(copyright: string, yearRanges: string[]): string {
    return 'Invalid copyright string. Copyright should start at first character of file and be:\n' +
      `${copyright.replace(/%%%/, '[YEAR RANGE]')} where [YEAR RANGE] is one of:\n${JSON.stringify(yearRanges)}`;
  }
}
