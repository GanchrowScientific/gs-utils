/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */
'use strict';

// include this line to fix stack traces
import 'source-map-support/register';

import 'jasmine';

import { delay } from '../src/delay';
import { TaskQueue } from '../src/taskQueue';

describe('TaskQueue', () => {

  let noopFunction = () => { /* noop */ };

  it('should enqueue a task with correct type and proccess it', (done) => {
    let testType = 'testType';
    let testTask = {
      key: 'value'
    };
    let q = new TaskQueue(1, (type, task) => {
      expect(type).toEqual(testType);
      expect(task).toEqual(testTask);
      done();
    });
    q.push(testType, testTask);
  });

  it('should call error handler if an error happens', (done) => {
    let testError = new Error('test error');
    let q = new TaskQueue(1, (type, task) => {
      throw testError;
    },
    (error) => {
      expect(error).toEqual(testError);
      done();
    }
    );
    q.push('type', {});
  });

  it('should discard older tasks if one of the same type arrives in the queue', (done) => {
    let testType = 'testType';
    let otherType = 'otherType';
    let calls = 0;
    let discarded = 0;
    let q = new TaskQueue(2, (type, task) => {
      calls++;
      expect(task.description).toEqual('this is one is going to be attended');
      if (task.id === 1) {
        // during this second tasks of testType are going to be enqueued
        // but only the last one is going to be executed
        return delay(1);
      }
      if (task.id === 2) {
        expect(type).toEqual(otherType);
      }
      if (task.id === 5 && calls === 3 && discarded === 2) {
        done();
      }
    }, noopFunction, (type, task) => {
      discarded++;
      expect(task.description).toEqual('this is one is going to be discarded');
      expect(type).toEqual(testType);
      if (task.id === 3) {
        expect(task.id).toBe(3);
      } else {
        expect(task.id).toBe(4);
      }
    });
    q.push(testType, {
      first: 'task',
      description: 'this is one is going to be attended',
      id: 1
    });
    delay(1).then(() => {
      q.push(otherType, {
        first: 'task',
        description: 'this is one is going to be attended',
        id: 2
      });
      q.push(testType, {
        first: 'task',
        description: 'this is one is going to be discarded',
        id: 3
      });
      q.push(testType, {
        first: 'task',
        description: 'this is one is going to be discarded',
        id: 4
      });
      q.push(testType, {
        first: 'task',
        description: 'this is one is going to be attended',
        id: 5
      });
    });
  });

  it('should limit the number of tasks for different types executing at the same time to 1', (done) => {
    let testType = 'testType';
    let otherType = 'otherType';
    let executing = false;
    let q = new TaskQueue(1, async (type, task) => {
      expect(executing).toBe(false);
      executing = true;
      await delay(1);
      executing = false;
      if (task.id === 2) {
        done();
      }
    });
    q.push(testType, {
      first: 'task',
      description: 'this is one is going to be attended',
      id: 1
    });
    q.push(otherType, {
      first: 'task',
      description: 'this is one is going to be attended',
      id: 2
    });
  });

  it('should limit the number of tasks for different types executing at the same time to 10', (done) => {
    let executing = 0;
    let numberOfTasks = 100;
    let q = new TaskQueue(10, async (type, task) => {
      executing++;
      expect(executing).toBeLessThanOrEqual(10);
      await delay(1);
      executing--;
      if (task.id === numberOfTasks - 1) {
        done();
      }
    });
    Array(numberOfTasks).fill(0).forEach((el, ix) => {
      q.push(ix.toString(), {
        id: ix
      });
    });
  }, 100000);

  it('should repush a task in the errorHandler', (done) => {
    let somethingIsBroken = true;
    let testError = new Error('test error');
    let q = new TaskQueue(1, (type, task) => {
      if (somethingIsBroken) {
        throw testError;
      } else {
        done();
      }
    },
    (error, type, task, pushBack) => {
      expect(error).toEqual(testError);
      somethingIsBroken = false;
      pushBack();
    }
    );
    q.push('type', {});
  });

  it('should pause the queue fix the error and continue', (done) => {
    let brokenTypes = {
      type5: true,
      type7: true
    };
    let proccesed = 0;
    let testError = new Error('test error');
    let q = new TaskQueue(2, (type, task) => {
      if (brokenTypes[type]) {
        throw testError;
      }
      proccesed++;
      if (proccesed === 8) {
        done();
      }
    },
    async(error, type, task, pushBack) => {
      q.pause();
      await delay(2);
      brokenTypes[type] = false;
      pushBack();
      q.resume();
    }
    );
    q.push('type1', {id: 1});
    q.push('type2', {id: 2});
    q.push('type3', {id: 3});
    q.push('type4', {id: 4});
    q.push('type5', {id: 5});
    q.push('type6', {id: 6});
    q.push('type7', {id: 7});
    q.push('type8', {id: 8});
  }, 5000);

  it('should dump the queue when required', (done) => {
    let brokenTypes = {
      type5: true,
      type7: true
    };
    let testError = new Error('test error');
    let q = new TaskQueue(2, (type, task) => {
      if (brokenTypes[type]) {
        throw testError;
      }
    },
    async(error, type, task, pushBack) => {
      q.pause();
      pushBack();
      q.dump();
    }
    );
    q.push('type1', {id: 1});
    q.push('type2', {id: 2});
    q.push('type3', {id: 3});
    q.push('type4', {id: 4});
    q.push('type5', {id: 5});
    q.push('type6', {id: 6});
    q.push('type7', {id: 7});
    q.push('type8', {id: 8});
    q.onDump((dumpedTasks) => {
      expect(dumpedTasks).toEqual({
        '4': { task: { id: 5 }, type: 'type5', seq: 4 },
        '5': { task: { id: 6 }, type: 'type6', seq: 5 },
        '6': { task: { id: 7 }, type: 'type7', seq: 6 },
        '7': { task: { id: 8 }, type: 'type8', seq: 7 } });
      done();
    });
  }, 5000);

  it('should restore the queue from dumpedTasks', (done) => {
    let dumpedTasks = {
      '1': { task: { id: 5 }, type: 'type5', seq: 1 },
      '2': { task: { id: 6 }, type: 'type6', seq: 2 },
      '3': { task: { id: 7 }, type: 'type7', seq: 3 },
      '4': { task: { id: 8 }, type: 'type8', seq: 4 } };
    let count = 1;
    // tslint:disable-next-line: no-unused-expression
    new TaskQueue(2, (type, task) => {
      expect({type, task}).toEqual({task: dumpedTasks[count].task, type: dumpedTasks[count].type});
      count++;
      if (count === 4) {
        done();
      }
    },
    noopFunction,
    noopFunction,
    dumpedTasks
    );
  });

});
