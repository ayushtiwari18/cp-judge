/**
 * Process Timeout Control
 * 
 * RESPONSIBILITIES:
 * - Execute commands with enforced time limits
 * - Kill processes that exceed timeout
 * - Capture stdout and stderr
 * - Detect runtime errors and timeouts
 * - Measure precise execution time
 * 
 * SECURITY NOTE:
 * - Uses shell: true for command execution
 * - DO NOT expose to untrusted input without sanitization
 * - Recommended for local/trusted environments only
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

/**
 * Execute command with timeout and precise time measurement
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {string} options.cwd - Working directory
 * @param {string} options.input - Input to pass via stdin
 * @returns {Promise<object>} Execution result with precise timing
 */
export function executeWithTimeout(command, args, options = {}) {
  return new Promise((resolve) => {
    const {
      timeout = 2000,
      cwd = process.cwd(),
      input = ''
    } = options;

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    // Start high-resolution timer
    const startTime = performance.now();

    // Spawn process
    const child = spawn(command, args, {
      cwd,
      shell: true, // SECURITY: Required for command templates, but be cautious
      timeout: timeout + 100 // Buffer for graceful termination
    });

    // Setup timeout killer
    const timeoutId = setTimeout(() => {
      timedOut = true;
      killed = true;
      child.kill('SIGKILL'); // Force kill
    }, timeout);

    // Collect stdout
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code) => {
      clearTimeout(timeoutId);

      // Calculate precise execution time
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      resolve({
        stdout: stdout,
        stderr: stderr,
        exitCode: code,
        timedOut: timedOut,
        killed: killed,
        executionTime: executionTime // Precise measurement in milliseconds
      });
    });

    // Handle process errors (e.g., command not found)
    child.on('error', (error) => {
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      resolve({
        stdout: '',
        stderr: error.message,
        exitCode: -1,
        timedOut: false,
        killed: false,
        error: error,
        executionTime: executionTime
      });
    });

    // Pass input via stdin if provided
    if (input && child.stdin) {
      child.stdin.write(input);
      child.stdin.end();
    }
  });
}

/**
 * Parse command string into command and args
 * @param {string} commandString - Full command string
 * @returns {object} { command, args }
 */
export function parseCommand(commandString) {
  const parts = commandString.split(/\s+/);
  return {
    command: parts[0],
    args: parts.slice(1)
  };
}
