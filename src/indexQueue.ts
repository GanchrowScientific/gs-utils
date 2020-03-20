/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

export class IndexQueue<T> {
  private data: {[index: number]: T } = Object.create(null);
  private lastDequeueIndex = 0;
  private nextEnqueueIndex = 0;

  public size() {
    return this.nextEnqueueIndex - this.lastDequeueIndex;
  }

  public isEmpty() {
    return this.size() === 0;
  }

  public enqueue(item: T): void {
    this.data[this.nextEnqueueIndex++] = item;
  }

  public dequeue(): T | undefined {
    if (this.lastDequeueIndex !== this.nextEnqueueIndex) {
      let dequeued = this.data[this.lastDequeueIndex];
      delete this.data[this.lastDequeueIndex++];
      return dequeued;
    }
  }
}
