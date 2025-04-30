/* Copyright © 2025 Ganchrow Scientific, SA all rights reserved */

'use strict';

import 'source-map-support/register';
import 'jasmine';
import * as sinon from 'sinon';
import { MetricAggregator } from '../src/metricAggregator';

describe('MetricAggregator', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('constructor', () => {
    it('should throw an error if flushPeriodMs is less than 1', () => {
      expect(() => new MetricAggregator(0, 1000))
        .toThrowError('Flush period must be greater than 0; got 0');
    });

    it('should throw an error if flushSize is less than 1', () => {
      expect(() => new MetricAggregator(60000, 0))
        .toThrowError('Flush size must be greater than 0; got 0');
    });

    it('should create an instance with default values', () => {
      const aggregator = new MetricAggregator();
      expect(aggregator).toBeDefined();
    });
  });

  describe('add', () => {
    it('should add a value without triggering a flush', () => {
      const aggregator = new MetricAggregator(60000, 3);
      const result = aggregator.add(10);
      expect(result).toBeNull();
    });

    it('should trigger a flush when flushSize is reached', () => {
      const aggregator = new MetricAggregator(60000, 3);
      aggregator.add(10);
      aggregator.add(20);
      const result = aggregator.add(30);
      expect(result).toEqual(jasmine.objectContaining({
        count: 3,
        min: 10,
        max: 30,
        mean: 20,
      }));
    });

    it('should trigger a flush when flushPeriodMs is exceeded', () => {
      const aggregator = new MetricAggregator(1000, 1000);
      aggregator.add(10);
      clock.tick(1001); // Advance time by 1001ms
      const result = aggregator.add(20);
      expect(result).toEqual(jasmine.objectContaining({
        count: 2,
        min: 10,
        max: 20,
        mean: 15,
      }));
    });

    it('should handle multiple flushes correctly', () => {
      const aggregator = new MetricAggregator(1000, 2);
      aggregator.add(10);
      aggregator.add(20); // First flush
      clock.tick(1001); // Advance time to trigger second flush
      const result = aggregator.add(30);
      expect(result).toEqual(jasmine.objectContaining({
        count: 1,
        min: 30,
        max: 30,
        mean: 30,
      }));
    });
  });

  describe('flush', () => {
    it('should return correct stats when flushed', () => {
      const aggregator = new MetricAggregator(60000, 4);
      aggregator.add(10);
      aggregator.add(20);
      aggregator.add(30);
      const result = aggregator.add(40); // Triggers flush
      expect(result).toEqual(jasmine.objectContaining({
        count: 4,
        min: 10,
        max: 40,
        mean: 25,
      }));
    });

    it('should handle empty flush correctly', () => {
      const aggregator = new MetricAggregator(60000, 3);
      clock.tick(60001); // Advance time to trigger flush
      const result = aggregator.flush();
      expect(result).toEqual(jasmine.objectContaining({
        count: 0,
      }));
    });

    it('should reset items after flush', () => {
      const aggregator = new MetricAggregator(60000, 3);
      aggregator.add(10);
      aggregator.add(20);
      aggregator.add(30); // Triggers flush
      aggregator.add(40);
      const result = aggregator.add(50); // New data after flush
      expect(result).toBeNull();
    });
  });
});
