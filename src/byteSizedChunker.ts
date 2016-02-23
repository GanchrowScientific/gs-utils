/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

// tsc is not able to find bufferpack
/* tslint:disable:no-require-imports */
let bufferpack = require('bufferpack');
/* tslint:enable:no-require-imports */

export class ByteSizedChunker {
  private partial: Buffer;

  constructor(private bufferHeaderLength: number, private packFormat: string) {
    this.partial = new Buffer('', 'ascii');
  }

  public forEachCompleteChunk(dataBuf: Buffer, cb: (string) => void): void {
    this.partial = Buffer.concat([this.partial, dataBuf]);

    while (this.partial.length >= this.bufferHeaderLength +
      this.getExpectedMessageSize(this.partial)) {
      cb(this.getMessage(this.partial));
      this.partial = this.getNextPartial(this.partial);
    }
  }

  private getExpectedMessageSize(data: Buffer) {
    if (data.length < this.bufferHeaderLength) {
      return Number.POSITIVE_INFINITY;
    }
    return bufferpack.unpack(this.packFormat, data.slice(0, this.bufferHeaderLength))[0];
  }

  private getMessage(data: Buffer): string {
    return data.slice(this.bufferHeaderLength,
      this.bufferHeaderLength + this.getExpectedMessageSize(data)).toString('ascii');
  }

  private getNextPartial(data: Buffer): Buffer {
    return data.slice(this.bufferHeaderLength + this.getExpectedMessageSize(data));
  }
}
