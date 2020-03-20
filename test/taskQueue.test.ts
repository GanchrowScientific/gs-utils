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

});
