/**
 * Execution Orchestrator
 * 
 * RESPONSIBILITIES:
 * - Coordinate execution lifecycle
 * - Manage workspace creation/cleanup
 * - Handle compilation
 * - Run test cases sequentially
 * - Return aggregated results with summary
 */

import { getLanguage } from '../languages/config.js';
import { createWorkspace, writeSourceFile, cleanupWorkspace } from '../utils/fileSystem.js';
import { compile } from '../executor/compiler.js';
import { runProgram } from '../executor/runner.js';
import { determineVerdict, createCompilationErrorVerdict, VERDICTS } from '../executor/verdictEngine.js';
import { info, warn, error as logError } from '../utils/logger.js';

/**
 * Execute code with test cases
 * @param {string} languageId - Language identifier
 * @param {string} code - Source code
 * @param {Array} testCases - Array of test case objects
 * @param {number} timeLimit - Time limit in milliseconds
 * @returns {Promise<object>} Execution results
 */
export async function executeCode(languageId, code, testCases, timeLimit = 2000) {
  let workspacePath = null;

  try {
    // Get language configuration
    const langConfig = getLanguage(languageId);
    if (!langConfig) {
      throw new Error(`Language not found: ${languageId}`);
    }

    // Create isolated workspace
    workspacePath = await createWorkspace();
    info(`Workspace created: ${workspacePath}`);

    // Determine source filename
    let sourceFileName = `Main${langConfig.extension}`;
    if (langConfig.enforceClassName) {
      sourceFileName = `${langConfig.enforceClassName}${langConfig.extension}`;
    }

    // Write source code to file
    await writeSourceFile(workspacePath, sourceFileName, code);
    info(`Source file written: ${sourceFileName}`);

    // Compile if needed
    const compileResult = await compile(langConfig, workspacePath, sourceFileName);
    
    if (!compileResult.success) {
      warn('Compilation failed');
      return {
        success: false,
        compilationError: createCompilationErrorVerdict(compileResult.stderr),
        results: [],
        summary: {
          overallVerdict: VERDICTS.CE,
          totalTests: testCases.length,
          passed: 0,
          failed: testCases.length,
          totalTime: 0
        }
      };
    }

    info('Compilation successful');

    // Run test cases
    const results = [];
    let totalTime = 0;
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      info(`Running test case ${i + 1}/${testCases.length}`);

      // Execute program with test input
      const executionResult = await runProgram(
        langConfig,
        workspacePath,
        sourceFileName,
        testCase.input,
        timeLimit
      );

      // Determine verdict
      const verdict = determineVerdict(executionResult, testCase.expectedOutput);
      
      totalTime += executionResult.executionTime || 0;

      results.push({
        testCase: i + 1,
        verdict: verdict.verdict,
        message: verdict.message,
        actualOutput: verdict.actualOutput,
        expectedOutput: verdict.expectedOutput,
        stderr: verdict.stderr,
        executionTime: executionResult.executionTime || 0,
        diff: verdict.diff || null  // Include diff for WA cases
      });

      info(`Test case ${i + 1}: ${verdict.verdict} (${executionResult.executionTime || 0}ms)`);
    }

    // Calculate summary
    const summary = calculateSummary(results, totalTime);
    
    // Log final summary
    logSummary(summary);

    return {
      success: true,
      results: results,
      compilationError: null,
      summary: summary
    };

  } catch (error) {
    logError('Execution error:', error);
    throw error;

  } finally {
    // Always cleanup workspace
    if (workspacePath) {
      await cleanupWorkspace(workspacePath);
      info('Workspace cleaned up');
    }
  }
}

/**
 * Calculate summary statistics from results
 * @param {Array} results - Test case results
 * @param {number} totalTime - Total execution time
 * @returns {object} Summary statistics
 */
function calculateSummary(results, totalTime) {
  const verdictCounts = {
    [VERDICTS.AC]: 0,
    [VERDICTS.WA]: 0,
    [VERDICTS.TLE]: 0,
    [VERDICTS.RE]: 0
  };

  let firstFailure = null;

  results.forEach(result => {
    verdictCounts[result.verdict]++;
    if (!firstFailure && result.verdict !== VERDICTS.AC) {
      firstFailure = result.testCase;
    }
  });

  const passed = verdictCounts[VERDICTS.AC];
  const total = results.length;
  
  // Overall verdict determination
  let overallVerdict;
  if (passed === total) {
    overallVerdict = VERDICTS.AC;
  } else if (verdictCounts[VERDICTS.TLE] > 0) {
    overallVerdict = VERDICTS.TLE;
  } else if (verdictCounts[VERDICTS.RE] > 0) {
    overallVerdict = VERDICTS.RE;
  } else {
    overallVerdict = VERDICTS.WA;
  }

  return {
    overallVerdict: overallVerdict,
    totalTests: total,
    passed: passed,
    failed: total - passed,
    firstFailure: firstFailure,
    verdictBreakdown: verdictCounts,
    totalTime: totalTime,
    avgTime: total > 0 ? Math.round(totalTime / total) : 0
  };
}

/**
 * Log summary to console
 * @param {object} summary - Summary object
 */
function logSummary(summary) {
  console.log('\n' + '━'.repeat(50));
  console.log('  TEST SUMMARY');
  console.log('━'.repeat(50));
  console.log(`Overall Verdict: ${summary.overallVerdict}`);
  console.log(`Tests Passed: ${summary.passed}/${summary.totalTests}`);
  
  if (summary.firstFailure) {
    console.log(`First Failure: Test ${summary.firstFailure}`);
  }
  
  console.log(`Total Time: ${summary.totalTime}ms`);
  console.log(`Average Time: ${summary.avgTime}ms`);
  console.log('━'.repeat(50) + '\n');
}
