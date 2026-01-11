/**
 * Compiler Module
 * 
 * RESPONSIBILITIES:
 * - Compile source code based on language configuration
 * - Capture compilation errors
 * - Validate compiler availability
 * - Return structured compilation result
 */

import { executeWithTimeout, parseCommand } from '../utils/timeout.js';
import { getExecutablePath, fileExists } from '../utils/fileSystem.js';
import path from 'path';

/**
 * Compile source code
 * @param {object} langConfig - Language configuration object
 * @param {string} workspacePath - Workspace directory path
 * @param {string} sourceFileName - Name of source file
 * @returns {Promise<object>} Compilation result
 */
export async function compile(langConfig, workspacePath, sourceFileName) {
  // Skip compilation if not needed
  if (!langConfig.needsCompilation) {
    return {
      success: true,
      message: 'Compilation not required',
      stderr: ''
    };
  }

  // Build compilation command
  const compileCommand = langConfig.compile
    .replace('{file}', sourceFileName)
    .replace('{executable}', langConfig.executable);

  const { command, args } = parseCommand(compileCommand);

  console.log(`[COMPILE] Running: ${compileCommand}`);

  // Execute compilation
  const result = await executeWithTimeout(command, args, {
    cwd: workspacePath,
    timeout: 10000 // 10 seconds for compilation
  });

  // Check compilation success
  if (result.exitCode !== 0 || result.stderr) {
    // Check for error patterns
    const hasError = langConfig.errorPatterns?.some(pattern => 
      pattern.test(result.stderr)
    );

    if (hasError || result.exitCode !== 0) {
      return {
        success: false,
        message: 'Compilation failed',
        stderr: result.stderr,
        stdout: result.stdout
      };
    }
  }

  // Verify executable was created (for compiled languages)
  if (langConfig.executable) {
    const execPath = getExecutablePath(workspacePath, langConfig.executable);
    const exists = await fileExists(execPath);
    
    if (!exists) {
      return {
        success: false,
        message: 'Executable not found after compilation',
        stderr: `Expected: ${execPath}`,
        stdout: result.stdout
      };
    }
  }

  return {
    success: true,
    message: 'Compilation successful',
    stderr: result.stderr,
    stdout: result.stdout
  };
}
