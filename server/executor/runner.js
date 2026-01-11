/**
 * Runner Module
 * 
 * RESPONSIBILITIES:
 * - Execute compiled/interpreted code
 * - Pass input via stdin
 * - Capture stdout and stderr
 * - Enforce timeout
 * - Return execution result per test case with precise timing
 */

import { executeWithTimeout, parseCommand } from '../utils/timeout.js';
import path from 'path';

/**
 * Run program with input
 * @param {object} langConfig - Language configuration object
 * @param {string} workspacePath - Workspace directory path
 * @param {string} sourceFileName - Name of source file
 * @param {string} input - Test case input
 * @param {number} timeLimit - Time limit in milliseconds
 * @returns {Promise<object>} Execution result with precise timing
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

  console.log(`[RUN] Executing: ${runCommand}`);
  console.log(`[RUN] Input length: ${input.length} chars`);
  console.log(`[RUN] Time limit: ${timeLimit}ms`);

  // Execute program with precise timing
  const result = await executeWithTimeout(command, args, {
    cwd: workspacePath,
    timeout: timeLimit,
    input: input
  });

  console.log(`[RUN] Execution completed in ${result.executionTime}ms`);

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    killed: result.killed,
    executionTime: result.executionTime // Precise measurement from timeout module
  };
}
