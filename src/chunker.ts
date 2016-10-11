/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */
'use strict';

export class Chunker {
  private static LINEFEED =  '\n';
  private partial: string;
  private split: string;

  constructor(split?: string) {
    this.partial = '';
    this.split = split || Chunker.LINEFEED;
  }

  public forEachCompleteChunk(dataBuf: Buffer | string, cb: (string) => void): void {
    let data = (<any> dataBuf).toString('utf8').split(this.split);
    let lastIdx = data.length - 1;
    this.partial += data[0];
    for (let i = 0; i < lastIdx; i++) {
      cb(this.partial);
      this.partial = data[i + 1];
    }
  }
}
