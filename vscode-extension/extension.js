/**
 * CP Judge VS Code Extension
 * 
 * ARCHITECTURE:
 * - Thin client (no code execution)
 * - Detects active file & language
 * - Reads test files (input.txt / output.txt)
 * - Calls local judge server
 * - Displays results in Output Channel
 * 
 * RESPONSIBILITIES:
 * - User interface only
 * - NO compilation, execution, or process management
 * - All heavy lifting done by server
 */

const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Local judge server URL
const JUDGE_SERVER = 'http://localhost:3000';

// VS Code language ID → Judge language mapping
const LANGUAGE_MAP = {
  'cpp': 'cpp',
  'c': 'cpp',
  'python': 'python',
  'javascript': 'javascript',
  'typescript': 'javascript',
  'java': 'java'
};

// Output channel (global, persists across commands)
let outputChannel = null;

/**
 * Extension activation
 * Called when command is first invoked
 */
function activate(context) {
  console.log('CP Judge extension activated');

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('CP Judge');

  // Register command
  const disposable = vscode.commands.registerCommand(
    'cpjudge.run',
    runJudge
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(outputChannel);
}

/**
 * Extension deactivation
 * Cleanup resources
 */
function deactivate() {
  if (outputChannel) {
    outputChannel.dispose();
  }
}

/**
 * Main command handler: Run code through judge
 */
async function runJudge() {
  // Clear and show output
  outputChannel.clear();
  outputChannel.show(true);
  outputChannel.appendLine('🚀 CP Judge - Starting execution...');
  outputChannel.appendLine('');

  try {
    // Step 1: Health check
    outputChannel.appendLine('[1/5] Checking server health...');
    await checkServer();
    outputChannel.appendLine('✅ Server is running');
    outputChannel.appendLine('');

    // Step 2: Get active file
    outputChannel.appendLine('[2/5] Reading active file...');
    const { code, filePath, languageId } = getActiveFile();
    const judgeLanguage = LANGUAGE_MAP[languageId];
    
    if (!judgeLanguage) {
      throw new Error(
        `Unsupported language: ${languageId}\n` +
        `Supported: C++, Java, Python, JavaScript`
      );
    }
    
    outputChannel.appendLine(`✅ File: ${path.basename(filePath)}`);
    outputChannel.appendLine(`✅ Language: ${judgeLanguage}`);
    outputChannel.appendLine('');

    // Step 3: Read test files
    outputChannel.appendLine('[3/5] Reading test files...');
    const workspaceRoot = getWorkspaceRoot();
    const testCases = readTestFiles(workspaceRoot);
    outputChannel.appendLine(`✅ Found ${testCases.length} test case(s)`);
    outputChannel.appendLine('');

    // Step 4: Submit to judge
    outputChannel.appendLine('[4/5] Submitting to judge...');
    const response = await axios.post(`${JUDGE_SERVER}/api/run`, {
      language: judgeLanguage,
      code: code,
      testCases: testCases,
      timeLimit: 2000
    });
    outputChannel.appendLine('✅ Execution complete');
    outputChannel.appendLine('');

    // Step 5: Display results
    outputChannel.appendLine('[5/5] Results:');
    outputChannel.appendLine('━'.repeat(60));
    displayResults(response.data);

  } catch (error) {
    outputChannel.appendLine('');
    outputChannel.appendLine('❌ ERROR: ' + error.message);
    outputChannel.appendLine('');
    
    // Show error popup for critical issues
    vscode.window.showErrorMessage(
      `CP Judge: ${error.message}`
    );
  }
}

/**
 * Check if judge server is running
 * @throws Error if server is offline
 */
async function checkServer() {
  try {
    await axios.get(`${JUDGE_SERVER}/api/health`, { timeout: 3000 });
  } catch (error) {
    throw new Error(
      'Judge server not running.\n' +
      'Start server with: cd server && npm start'
    );
  }
}

/**
 * Get currently active file and its contents
 * @returns {object} { code, filePath, languageId }
 * @throws Error if no file is open
 */
function getActiveFile() {
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    throw new Error('No file is currently open');
  }

  return {
    code: editor.document.getText(),
    filePath: editor.document.fileName,
    languageId: editor.document.languageId
  };
}

/**
 * Get workspace root directory
 * @returns {string} Workspace root path
 * @throws Error if no workspace is open
 */
function getWorkspaceRoot() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error('No workspace folder is open');
  }

  return workspaceFolders[0].uri.fsPath;
}

/**
 * Read test cases from input.txt and output.txt
 * Convention: Each test case separated by blank line or specific delimiter
 * 
 * @param {string} workspaceRoot - Workspace directory path
 * @returns {Array} Array of test case objects
 * @throws Error if test files not found
 */
function readTestFiles(workspaceRoot) {
  const inputPath = path.join(workspaceRoot, 'input.txt');
  const outputPath = path.join(workspaceRoot, 'output.txt');

  // Check if files exist
  if (!fs.existsSync(inputPath)) {
    throw new Error(
      'input.txt not found in workspace root.\n' +
      'Create input.txt with test inputs.'
    );
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      'output.txt not found in workspace root.\n' +
      'Create output.txt with expected outputs.'
    );
  }

  // Read files
  const input = fs.readFileSync(inputPath, 'utf8');
  const output = fs.readFileSync(outputPath, 'utf8');

  // Simple format: Single test case (can be extended later)
  return [{
    input: input.trim(),
    expectedOutput: output.trim()
  }];
}

/**
 * Display execution results in output channel
 * @param {object} result - Judge response data
 */
function displayResults(result) {
  if (!result.success) {
    outputChannel.appendLine('❌ EXECUTION FAILED');
    outputChannel.appendLine('');
    
    if (result.compilationError) {
      outputChannel.appendLine('COMPILATION ERROR:');
      outputChannel.appendLine(result.compilationError.message);
      outputChannel.appendLine('');
      outputChannel.appendLine('Details:');
      outputChannel.appendLine(result.compilationError.details);
    }
    return;
  }

  // Summary
  const summary = result.summary;
  outputChannel.appendLine(`Overall Verdict: ${getVerdictEmoji(summary.overallVerdict)} ${summary.overallVerdict}`);
  outputChannel.appendLine(`Tests Passed: ${summary.passed}/${summary.totalTests}`);
  outputChannel.appendLine(`Total Time: ${summary.totalTime}ms`);
  outputChannel.appendLine(`Peak Memory: ${summary.peakMemory}MB`);
  outputChannel.appendLine('');

  // Individual test results
  result.results.forEach((test, index) => {
    outputChannel.appendLine(`Test Case ${test.testCase}:`);
    outputChannel.appendLine(`  Verdict: ${getVerdictEmoji(test.verdict)} ${test.verdict}`);
    outputChannel.appendLine(`  Time: ${test.executionTime}ms`);
    outputChannel.appendLine(`  Memory: ${test.memory.peak}MB`);
    
    if (test.verdict === 'WA' && test.diff) {
      outputChannel.appendLine('');
      outputChannel.appendLine('  Difference:');
      test.diff.split('\n').forEach(line => {
        outputChannel.appendLine('    ' + line);
      });
    }
    
    if (test.stderr && test.stderr.trim()) {
      outputChannel.appendLine('');
      outputChannel.appendLine('  Error Output:');
      test.stderr.split('\n').slice(0, 5).forEach(line => {
        outputChannel.appendLine('    ' + line);
      });
    }
    
    outputChannel.appendLine('');
  });

  outputChannel.appendLine('━'.repeat(60));
  
  // Final verdict message
  if (summary.overallVerdict === 'AC') {
    outputChannel.appendLine('✅ All tests passed!');
  } else {
    outputChannel.appendLine(`❌ Failed on test case ${summary.firstFailure}`);
  }
}

/**
 * Get emoji for verdict
 * @param {string} verdict - Verdict string (AC, WA, TLE, etc.)
 * @returns {string} Emoji
 */
function getVerdictEmoji(verdict) {
  const emojiMap = {
    'AC': '✅',
    'WA': '❌',
    'TLE': '⏱️',
    'RE': '💥',
    'CE': '🔨',
    'MLE': '💾'
  };
  return emojiMap[verdict] || '❓';
}

module.exports = {
  activate,
  deactivate
};
