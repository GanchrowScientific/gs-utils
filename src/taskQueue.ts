/* Copyright © 2020-2022 Ganchrow Scientific, SA all rights reserved */
'use strict';

import { delay } from './delay';
import { IndexQueue } from './indexQueue';
import { EventEmitter } from 'events';

export type Handler = (type: string, task: any) => void;
export type ErrorHandler = (error: Error, type: string, task: any, pushBack: () => void ) => void;

export type TasksDump = {
  [index: number]: {type: string, task: any, seq: number}
};

type QueuedTask<T> = { type: string; task: T; seq: number };

export class TaskQueue<T> {
  private nextQueue = new IndexQueue<QueuedTask<T>>();
  private pendantQueue = new IndexQueue<QueuedTask<T>>();
  private processingTypes: {[index: string]: boolean } = Object.create(null);
  private moreRecentTypes: {[index: string]: number } = Object.create(null);
  private handler: Handler;
  private handleError: ErrorHandler;
  private discardTask: Handler;
  private maxConcurrency: number;
  private realMaxConcurrency: number;
  private pausePromiseResolver = () => {/* */};
  private isPaused = false;
  private working = false;
  private isDumping = false;
  private executingPromises: {[index: number]: Promise<any> } = Object.create(null);
  private sequence = 0;
  private shouldPause: Promise<void> = Promise.resolve();
  private eventEmitter = new EventEmitter();

  constructor(concurrency: number, handler: Handler, handleError?: ErrorHandler, discardTask?: Handler, restoredTasks?: TasksDump) {
    this.maxConcurrency = concurrency;
    this.realMaxConcurrency = concurrency;
    this.handler = handler;
    this.handleError = handleError;
    this.discardTask = discardTask;
    if (restoredTasks) {
      this.restore(restoredTasks);
    }
  }

  public push(type: string, task: T): Promise<void> {
    if (this.isDumping) {
      throw 'The queue has dumped the items and is unusable';
    }
    let seq = this.sequence++;
    this.nextQueue.enqueue({task, type, seq} as QueuedTask<T>);
    this.moreRecentTypes[type] = seq;
    if (!this.working) {
      return this.execute();
    }
  }

  public pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.maxConcurrency = 0;
      this.shouldPause = new Promise((resolve) => { this.pausePromiseResolver = resolve; });
    }
  }

  public resume(): void {
    if (this.isPaused && !this.isDumping) {
      this.isPaused = false;
      this.maxConcurrency = this.realMaxConcurrency;
      this.pausePromiseResolver();
    }
  }

  public async dump(): Promise<void> {
    if (!this.isDumping) {
      this.isDumping = true;
      let dumpedTasks = Object.create(null);
      this.pause();
      // we need to give time to the handle function to put all the
      // tasks that couldn't be catched by the pause into the executingPromises object.
      await delay(0);
      let executingPromisesArray = Object.values(this.executingPromises);
      await Promise.all(executingPromisesArray);
      while (!this.nextQueue.isEmpty()) {
        let item = this.nextQueue.dequeue();
        dumpedTasks[item.seq] = item;
      }
      while (!this.pendantQueue.isEmpty()) {
        let item = this.pendantQueue.dequeue();
        dumpedTasks[item.seq] = item;
      }
      this.eventEmitter.emit('dump', dumpedTasks);
    }
  }

  public onDump(listener) {
    this.eventEmitter.addListener('dump', listener);
  }

  private isProccesingType(type): boolean {
    return this.processingTypes[type];
  }


  private restore(tasks: TasksDump) {
    Object.values(tasks)
      .sort((a, b) => a.seq - b.seq)
      .forEach(taskItem => {
        this.push(taskItem.type, taskItem.task);
      });
  }

  private pushBackFactory(type: string, task: T, seq: number): () => Promise<void> {
    return () => {
      this.pendantQueue.enqueue({task, type, seq} as QueuedTask<T>);
      if (!this.working) {
        return this.execute();
      }
    };
  }

  private async handle({type, task, seq}): Promise<void> {
    if (this.moreRecentTypes[type] === seq) {
      this.processingTypes[type] = true;
      let worker = Promise.resolve()
        .then(() => this.handler(type, task))
        .catch((e) => {
          if (typeof this.handleError === 'function') {
            this.handleError(e, type, task, this.pushBackFactory(type, task, seq));
          }
        })
        .finally(() => {
          this.processingTypes[type] = false;
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
      await this.shouldPause;
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
