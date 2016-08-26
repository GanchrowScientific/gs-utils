/* Copyright © 2016 Ganchrow Scientific, SA all rights reserved */

'use strict';
import {EventEmitter} from 'events';

export class PrivateEventEmitter {
  protected eventEmitter = new EventEmitter();
  public on(event: string, cb: (...args: any[]) => void): EventEmitter {
    return this.eventEmitter.on(event, cb);
  }

  public once(event: string, cb: (...args: any[]) => void): EventEmitter {
    return this.eventEmitter.once(event, cb);
  }

  protected emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }
}

