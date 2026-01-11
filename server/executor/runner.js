/**
 * Runner Module
 * 
 * RESPONSIBILITIES:
 * - Execute compiled/interpreted code
 * - Pass input via stdin
 * - Capture stdout and stderr
 * - Enforce timeout
 * - Track memory usage
 * - Return execution result with metrics
 */

import { executeWithTimeout, parseCommand } from '../utils/timeout.js';
import { ExecutionMetrics } from '../utils/metrics.js';
import { debug } from '../utils/logger.js';
import path from 'path';

/**
 * Run program with input and track metrics
 * @param {object} langConfig - Language configuration object
 * @param {string} workspacePath - Workspace directory path
 * @param {string} sourceFileName - Name of source file
 * @param {string} input - Test case input
 * @param {number} timeLimit - Time limit in milliseconds
 * @returns {Promise<object>} Execution result with metrics
 */
export async function runProgram(langConfig, workspacePath, sourceFileName, input, timeLimit = 2000) {
  // Build run command
  let runCommand = langConfig.run
    .replace('{file}', sourceFileName)
    .replace('{executable}', langConfig.executable || '');

  // Handle platform-specific executable path for compiled languages
  if (langConfig.needsCompilation && langConfig.executable) {
    if (process.platform === 'win32') {
      // Windows: use executable name directly
      runCommand = runCommand.replace('./', '');
      if (!langConfig.executable.endsWith('.exe')) {
        runCommand = runCommand.replace(langConfig.executable, `${langConfig.executable}.exe`);
      }
    }
  }

  const { command, args } = parseCommand(runCommand);

  debug(`Executing: ${runCommand}`);
  debug(`Input length: ${input.length} chars`);
  debug(`Time limit: ${timeLimit}ms`);

  // Start metrics tracking
  const metrics = new ExecutionMetrics();
  metrics.start();

  // Execute program
  const result = await executeWithTimeout(command, args, {
    cwd: workspacePath,
    timeout: timeLimit,
    input: input
  });

  // Stop metrics and get statistics
  const executionMetrics = metrics.stop();

  debug(`Execution completed in ${result.executionTime}ms`);
  debug(`Peak memory: ${executionMetrics.memory.peak}MB`);

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    killed: result.killed,
    executionTime: result.executionTime,
    memory: {
      peak: executionMetrics.memory.peak,
      average: executionMetrics.memory.average,
      unit: 'MB'
    }
  };
}
