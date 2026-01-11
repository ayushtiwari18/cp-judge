/**
 * Execution Metrics Utility
 * 
 * RESPONSIBILITIES:
 * - Track execution time with high precision
 * - Monitor memory usage
 * - Measure CPU usage
 * - Provide performance statistics
 * 
 * NOTE: Memory tracking on local systems is approximate.
 * For accurate memory limits, use Docker/cgroups in production.
 */

import { performance } from 'perf_hooks';

/**
 * High-precision timer
 */
export class Timer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Start the timer
   */
  start() {
    this.startTime = performance.now();
  }

  /**
   * Stop the timer
   * @returns {number} Elapsed time in milliseconds
   */
  stop() {
    this.endTime = performance.now();
    return this.getElapsed();
  }

  /**
   * Get elapsed time without stopping
   * @returns {number} Elapsed time in milliseconds
   */
  getElapsed() {
    if (!this.startTime) return 0;
    const end = this.endTime || performance.now();
    return Math.round(end - this.startTime);
  }

  /**
   * Check if timer is running
   * @returns {boolean}
   */
  isRunning() {
    return this.startTime !== null && this.endTime === null;
  }
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  constructor() {
    this.samples = [];
    this.intervalId = null;
    this.sampleInterval = 50; // Sample every 50ms
  }

  /**
   * Start tracking memory
   */
  start() {
    this.samples = [];
    this._takeSample(); // Initial sample
    
    // Sample periodically
    this.intervalId = setInterval(() => {
      this._takeSample();
    }, this.sampleInterval);
  }

  /**
   * Stop tracking and return statistics
   * @returns {object} Memory statistics
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this._takeSample(); // Final sample
    
    return this.getStats();
  }

  /**
   * Take a memory sample
   * @private
   */
  _takeSample() {
    const usage = process.memoryUsage();
    this.samples.push({
      rss: usage.rss,           // Resident Set Size
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      timestamp: performance.now()
    });
  }

  /**
   * Get memory statistics
   * @returns {object} Memory stats in MB
   */
  getStats() {
    if (this.samples.length === 0) {
      return {
        peak: 0,
        average: 0,
        initial: 0,
        final: 0
      };
    }

    const toMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

    const heapUsages = this.samples.map(s => s.heapUsed);
    const peak = Math.max(...heapUsages);
    const sum = heapUsages.reduce((a, b) => a + b, 0);
    const average = sum / heapUsages.length;

    return {
      peak: toMB(peak),
      average: toMB(average),
      initial: toMB(this.samples[0].heapUsed),
      final: toMB(this.samples[this.samples.length - 1].heapUsed),
      samples: this.samples.length
    };
  }
}

/**
 * Combined metrics tracker for program execution
 */
export class ExecutionMetrics {
  constructor() {
    this.timer = new Timer();
    this.memoryTracker = new MemoryTracker();
  }

  /**
   * Start tracking all metrics
   */
  start() {
    this.timer.start();
    this.memoryTracker.start();
  }

  /**
   * Stop tracking and get all metrics
   * @returns {object} Complete metrics
   */
  stop() {
    const time = this.timer.stop();
    const memory = this.memoryTracker.stop();

    return {
      time: {
        elapsed: time,
        unit: 'ms'
      },
      memory: {
        peak: memory.peak,
        average: memory.average,
        delta: memory.final - memory.initial,
        unit: 'MB'
      }
    };
  }

  /**
   * Get current metrics without stopping
   * @returns {object} Current metrics
   */
  getCurrent() {
    return {
      time: {
        elapsed: this.timer.getElapsed(),
        unit: 'ms'
      },
      memory: {
        current: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        unit: 'MB'
      }
    };
  }
}

/**
 * Format metrics for display
 * @param {object} metrics - Metrics object
 * @returns {string} Formatted string
 */
export function formatMetrics(metrics) {
  const time = metrics.time.elapsed;
  const memory = metrics.memory.peak;
  
  return `${time}ms / ${memory}MB`;
}

/**
 * Check if execution exceeded limits
 * @param {object} metrics - Metrics object
 * @param {number} timeLimit - Time limit in ms
 * @param {number} memoryLimit - Memory limit in MB
 * @returns {object} Limit check results
 */
export function checkLimits(metrics, timeLimit, memoryLimit) {
  const timeLimitExceeded = metrics.time.elapsed > timeLimit;
  const memoryLimitExceeded = metrics.memory.peak > memoryLimit;

  return {
    timeLimitExceeded,
    memoryLimitExceeded,
    withinLimits: !timeLimitExceeded && !memoryLimitExceeded,
    timeUsage: Math.round((metrics.time.elapsed / timeLimit) * 100),
    memoryUsage: Math.round((metrics.memory.peak / memoryLimit) * 100)
  };
}

export default {
  Timer,
  MemoryTracker,
  ExecutionMetrics,
  formatMetrics,
  checkLimits
};
