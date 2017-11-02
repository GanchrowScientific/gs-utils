/* Copyright © 2017 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import { Chunker } from './chunker';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as Rx from 'rxjs';
import * as stream from 'stream';

export class FileSlurper {

  private chunker: Chunker;
  private isBinary: boolean;

  constructor(private filePath: string, private split?: string) {
    this.isBinary = this.filePath.endsWith('.gz');
  }

  public slurp(): Rx.Observable<string> {
    this.chunker = new Chunker(this.split);
    return Rx.Observable.create(observer => {
      try {
        this.createStream()
        .on('data', chunk => {
          this.chunker.forEachCompleteChunk(chunk, (buffer: Buffer) => {
            observer.next(buffer.toString());
          });
        })
        .on('end', () => observer.complete())
        .on('error', (err) => observer.error(err));

      } catch (e) {
        observer.error(e);
      }
    });
  }

  private createStream(): stream.Stream {
    if (this.isBinary) {
      let readStream = fs.createReadStream(this.filePath);
      return readStream.pipe(zlib.createGunzip());
    } else {
      return fs.createReadStream(this.filePath, { encoding: 'utf8' });
    }
  }
}
