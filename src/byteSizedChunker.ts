/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';

import * as bufferpack from 'bufferpack';

export class ByteSizedChunker {
  private partial: Buffer;

  constructor(private bufferHeaderLength: number, private packFormat: string) {
    this.partial = new Buffer(0);
  }

  public prepare(data: Buffer|string, dataType = 'ascii'): Buffer {
    let dataBuf = Buffer.isBuffer(data) ? data : new Buffer(data, dataType);
    return Buffer.concat([
      bufferpack.pack(this.packFormat, [dataBuf.length]),
      dataBuf
    ]);
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

  private getMessage(data: Buffer): Buffer {
    return data.slice(this.bufferHeaderLength,
      this.bufferHeaderLength + this.getExpectedMessageSize(data));
  }

  private getNextPartial(data: Buffer): Buffer {
    return data.slice(this.bufferHeaderLength + this.getExpectedMessageSize(data));
  }
}
