/**
 * API Routes
 * 
 * ENDPOINTS:
 * - POST /run - Execute code with test cases
 * - GET /health - Health check with compiler availability
 * - GET /languages - List supported languages
 */

import express from 'express';
import { executeCode } from './executor.js';
import { getSupportedLanguages, isLanguageSupported } from '../languages/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

/**
 * Check if a command exists on the system
 * @param {string} command - Command to check
 * @returns {Promise<boolean>} True if command exists
 */
async function commandExists(command) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`where ${command}`);
    } else {
      await execAsync(`which ${command}`);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Health check endpoint with compiler availability
 * Returns detailed system status
 */
router.get('/health', async (req, res) => {
  const warnings = [];
  
  // Check compiler/interpreter availability
  const compilerChecks = {
    cpp: await commandExists('g++'),
    java: await commandExists('javac'),
    python: await commandExists('python3') || await commandExists('python'),
    javascript: await commandExists('node')
  };

  // Generate warnings for missing compilers
  if (!compilerChecks.cpp) warnings.push('C++ compiler (g++) not found');
  if (!compilerChecks.java) warnings.push('Java compiler (javac) not found');
  if (!compilerChecks.python) warnings.push('Python 3 not found');
  if (!compilerChecks.javascript) warnings.push('Node.js not found');

  const status = warnings.length === 4 ? 'critical' : 
                 warnings.length > 0 ? 'degraded' : 'ok';

  res.json({
    status: status,
    timestamp: new Date().toISOString(),
    service: 'CP Judge Local',
    version: '1.0.0',
    compilers: compilerChecks,
    warnings: warnings,
    platform: process.platform,
    nodeVersion: process.version
  });
});

/**
 * List supported languages with availability status
 */
router.get('/languages', async (req, res) => {
  const languages = getSupportedLanguages();
  
  // Check which languages are actually usable
  const availability = {
    cpp: await commandExists('g++'),
    java: await commandExists('javac'),
    python: await commandExists('python3') || await commandExists('python'),
    javascript: await commandExists('node')
  };

  const languageDetails = languages.map(lang => ({
    id: lang,
    available: availability[lang] || false
  }));

  res.json({
    languages: languageDetails,
    count: languages.length,
    availableCount: languageDetails.filter(l => l.available).length
  });
});

/**
 * Execute code with test cases
 * 
 * REQUEST BODY:
 * {
 *   "language": "cpp" | "java" | "python" | "javascript",
 *   "code": "source code string",
 *   "testCases": [
 *     { "input": "...", "expectedOutput": "..." }
 *   ],
 *   "timeLimit": 2000 (optional, in milliseconds)
 * }
 * 
 * RESPONSE:
 * {
 *   "success": true,
 *   "results": [
 *     {
 *       "testCase": 1,
 *       "verdict": "AC",
 *       "message": "Accepted",
 *       "actualOutput": "...",
 *       "expectedOutput": "...",
 *       "executionTime": 45
 *     }
 *   ],
 *   "compilationError": null
 * }
 */
router.post('/run', async (req, res) => {
  try {
    // Validate request body
    const { language, code, testCases, timeLimit } = req.body;

    // Validation: Required fields
    if (!language || !code || !testCases) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: language, code, testCases'
      });
    }

    // Validation: Language support
    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`,
        supportedLanguages: getSupportedLanguages()
      });
    }

    // Validation: Test cases format
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'testCases must be a non-empty array'
      });
    }

    // Validation: Test case structure
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!tc.hasOwnProperty('input') || !tc.hasOwnProperty('expectedOutput')) {
        return res.status(400).json({
          success: false,
          error: `Test case ${i + 1} missing input or expectedOutput`
        });
      }
    }

    // Validation: Reasonable limits
    if (testCases.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 test cases allowed per request'
      });
    }

    if (code.length > 1024 * 64) { // 64KB
      return res.status(400).json({
        success: false,
        error: 'Code size exceeds maximum (64KB)'
      });
    }

    // Execute code
    console.log(`[API] Executing ${language} code with ${testCases.length} test cases`);
    const result = await executeCode(language, code, testCases, timeLimit);

    res.json(result);

  } catch (error) {
    console.error('[API ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
