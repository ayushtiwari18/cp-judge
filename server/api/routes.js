/**
 * API Routes
 * 
 * ENDPOINTS:
 * - POST /run - Execute code with test cases
 * - GET /health - Health check
 * - GET /languages - List supported languages
 */

import express from 'express';
import { executeCode } from './executor.js';
import { getSupportedLanguages, isLanguageSupported } from '../languages/config.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CP Judge Local'
  });
});

/**
 * List supported languages
 */
router.get('/languages', (req, res) => {
  const languages = getSupportedLanguages();
  res.json({
    languages: languages,
    count: languages.length
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
