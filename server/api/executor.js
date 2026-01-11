/**
 * Execution Orchestrator
 * 
 * RESPONSIBILITIES:
 * - Coordinate execution lifecycle
 * - Manage workspace creation/cleanup
 * - Handle compilation
 * - Run test cases sequentially
 * - Return aggregated results
 */

import { getLanguage } from '../languages/config.js';
import { createWorkspace, writeSourceFile, cleanupWorkspace } from '../utils/fileSystem.js';
import { compile } from '../executor/compiler.js';
import { runProgram } from '../executor/runner.js';
import { determineVerdict, createCompilationErrorVerdict, VERDICTS } from '../executor/verdictEngine.js';

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
    console.log(`[EXECUTOR] Workspace created: ${workspacePath}`);

    // Determine source filename
    let sourceFileName = `Main${langConfig.extension}`;
    if (langConfig.enforceClassName) {
      sourceFileName = `${langConfig.enforceClassName}${langConfig.extension}`;
    }

    // Write source code to file
    await writeSourceFile(workspacePath, sourceFileName, code);
    console.log(`[EXECUTOR] Source file written: ${sourceFileName}`);

    // Compile if needed
    const compileResult = await compile(langConfig, workspacePath, sourceFileName);
    
    if (!compileResult.success) {
      console.log('[EXECUTOR] Compilation failed');
      return {
        success: false,
        compilationError: createCompilationErrorVerdict(compileResult.stderr),
        results: []
      };
    }

    console.log('[EXECUTOR] Compilation successful');

    // Run test cases
    const results = [];
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`[EXECUTOR] Running test case ${i + 1}/${testCases.length}`);

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

      results.push({
        testCase: i + 1,
        verdict: verdict.verdict,
        message: verdict.message,
        actualOutput: verdict.actualOutput,
        expectedOutput: verdict.expectedOutput,
        stderr: verdict.stderr,
        executionTime: executionResult.executionTime || 0
      });

      console.log(`[EXECUTOR] Test case ${i + 1}: ${verdict.verdict}`);
    }

    return {
      success: true,
      results: results,
      compilationError: null
    };

  } catch (error) {
    console.error('[EXECUTOR ERROR]', error);
    throw error;

  } finally {
    // Always cleanup workspace
    if (workspacePath) {
      await cleanupWorkspace(workspacePath);
      console.log('[EXECUTOR] Workspace cleaned up');
    }
  }
}
