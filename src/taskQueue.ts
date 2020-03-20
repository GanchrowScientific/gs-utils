/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

import { delay } from './delay';
import { IndexQueue } from './indexQueue';

type Handler = (type: string, task: any) => void;
type ErrorHandlder = (error) => void;

export class TaskQueue {
  private nextQueue = new IndexQueue<any>();
  private pendantQueue = new IndexQueue<any>();
  private processing: {[index: string]: boolean } = Object.create(null);
  private moreRecentTypes: {[index: string]: number } = Object.create(null);
  private handler: Handler;
  private handleError: ErrorHandlder;
  private discardTask: Handler;
  private maxConcurrency: number;
  private working = false;
  private executingPromises: {[index: number]: Promise<any> } = Object.create(null);
  private sequence = 0;

  constructor(concurrency: number, handler: Handler, handleError?: ErrorHandlder, discardTask?: Handler) {
    this.maxConcurrency = concurrency;
    this.handler = handler;
    this.handleError = handleError;
    this.discardTask = discardTask;
  }

  public push(type: string, task: any): void {
    let seq = this.sequence++;
    this.nextQueue.enqueue({task, type, seq});
    this.moreRecentTypes[type] = seq;
    if (!this.working) {
      this.execute();
    }
  }

  private isProccesingType(type): boolean {
    return this.processing[type];
  }

  private async handle({type, task, seq}): Promise<void> {
    if (this.moreRecentTypes[type] === seq) {
      this.processing[type] = true;
      let worker = Promise.resolve()
        .then(() => this.handler(type, task))
        .catch((e) => {
          if (typeof this.handleError === 'function') {
            this.handleError(e);
          }
        })
        .finally(() => {
          this.processing[type] = false;
          delete this.executingPromises[seq];
        });
      this.executingPromises[seq] = worker;
      let executingPromisesArray = Object.values(this.executingPromises);
      if (executingPromisesArray.length >= this.maxConcurrency) {
        // here is when the magic happens, when the maxConcurrency is got, you wait
        // until any of the promises is resolved.
        // this way you stop the queue processing until you are ready to go on.
        await Promise.race(executingPromisesArray);
      }
    } else {
      if (typeof this.discardTask === 'function') {
        this.discardTask(type, task);
      }
    }
  }

  private async execute(): Promise<void> {
    this.working = true;
    while (!this.nextQueue.isEmpty() || !this.pendantQueue.isEmpty()) {
      if (!this.pendantQueue.isEmpty()) {
        let pendant = this.pendantQueue.dequeue();
        if (this.isProccesingType(pendant.type)) {
          if (this.moreRecentTypes[pendant.type] === pendant.seq) {
            this.pendantQueue.enqueue(pendant);
          } else {
            if (typeof this.discardTask === 'function') {
              this.discardTask(pendant.type, pendant.task);
            }
          }
        } else {
          await this.handle(pendant);
        }
      }
      if (!this.nextQueue.isEmpty()) {
        let next = this.nextQueue.dequeue();
        if (this.isProccesingType(next.type)) {
          this.pendantQueue.enqueue(next);
        } else {
          await this.handle(next);
        }
      }
      // this one is here to avoid blocking the eventloop.
      await delay(0);
    }
    this.working = false;
  }

}


