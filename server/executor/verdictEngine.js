/**
 * Verdict Engine
 * 
 * RESPONSIBILITIES:
 * - Classify execution results into standard verdicts
 * - Apply deterministic rules
 * - Provide detailed verdict information
 * - Generate diff for Wrong Answer cases
 * 
 * VERDICT TYPES:
 * - AC: Accepted (correct output)
 * - WA: Wrong Answer (output mismatch)
 * - TLE: Time Limit Exceeded
 * - RE: Runtime Error (crash, non-zero exit)
 * - CE: Compilation Error
 */

import { compareOutputs, strictNormalizeOutput } from '../utils/normalize.js';
import { generateDiff, formatDiffForConsole, formatDiffForAPI } from '../utils/diff.js';
import { info, warn } from '../utils/logger.js';

// Verdict constants
export const VERDICTS = {
  AC: 'AC',      // Accepted
  WA: 'WA',      // Wrong Answer
  TLE: 'TLE',    // Time Limit Exceeded
  RE: 'RE',      // Runtime Error
  CE: 'CE'       // Compilation Error
};

/**
 * Determine verdict from execution result
 * @param {object} executionResult - Result from runner
 * @param {string} expectedOutput - Expected output
 * @returns {object} Verdict information
 */
export function determineVerdict(executionResult, expectedOutput) {
  const { stdout, stderr, exitCode, timedOut } = executionResult;

  // Priority 1: Time Limit Exceeded
  if (timedOut) {
    return {
      verdict: VERDICTS.TLE,
      message: 'Time Limit Exceeded',
      actualOutput: stdout,
      expectedOutput: expectedOutput,
      stderr: stderr
    };
  }

  // Priority 2: Runtime Error (non-zero exit or stderr content)
  if (exitCode !== 0 && exitCode !== null) {
    return {
      verdict: VERDICTS.RE,
      message: `Runtime Error (exit code: ${exitCode})`,
      actualOutput: stdout,
      expectedOutput: expectedOutput,
      stderr: stderr,
      exitCode: exitCode
    };
  }

  // Check for runtime errors in stderr (even with exit code 0)
  if (stderr && stderr.trim().length > 0) {
    // Some warnings are acceptable, but errors are not
    const hasError = /error|exception|segmentation fault|core dumped/i.test(stderr);
    if (hasError) {
      return {
        verdict: VERDICTS.RE,
        message: 'Runtime Error detected in stderr',
        actualOutput: stdout,
        expectedOutput: expectedOutput,
        stderr: stderr
      };
    }
  }

  // Priority 3: Output Comparison
  const isCorrect = compareOutputs(stdout, expectedOutput);

  if (isCorrect) {
    return {
      verdict: VERDICTS.AC,
      message: 'Accepted',
      actualOutput: stdout,
      expectedOutput: expectedOutput,
      stderr: stderr
    };
  } else {
    // Generate diff for Wrong Answer
    const normalizedActual = strictNormalizeOutput(stdout);
    const normalizedExpected = strictNormalizeOutput(expectedOutput);
    const diff = generateDiff(normalizedExpected, normalizedActual);
    
    // Log diff to console
    warn('Wrong Answer detected');
    console.log(formatDiffForConsole(diff));
    
    return {
      verdict: VERDICTS.WA,
      message: 'Wrong Answer',
      actualOutput: stdout,
      expectedOutput: expectedOutput,
      stderr: stderr,
      diff: formatDiffForAPI(diff)  // Include diff in response
    };
  }
}

/**
 * Create compilation error verdict
 * @param {string} compileError - Compilation error message
 * @returns {object} Compilation error verdict
 */
export function createCompilationErrorVerdict(compileError) {
  return {
    verdict: VERDICTS.CE,
    message: 'Compilation Error',
    stderr: compileError,
    actualOutput: '',
    expectedOutput: ''
  };
}

/**
 * Get verdict display color (for UI integration)
 * @param {string} verdict - Verdict type
 * @returns {string} Color code
 */
export function getVerdictColor(verdict) {
  const colors = {
    [VERDICTS.AC]: '#10b981',   // Green
    [VERDICTS.WA]: '#ef4444',   // Red
    [VERDICTS.TLE]: '#f59e0b',  // Orange
    [VERDICTS.RE]: '#8b5cf6',   // Purple
    [VERDICTS.CE]: '#6366f1'    // Indigo
  };
  return colors[verdict] || '#6b7280'; // Gray default
}
