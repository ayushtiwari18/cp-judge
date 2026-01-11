/**
 * Background Service Worker
 * 
 * RESPONSIBILITIES:
 * - Communicate with local judge API
 * - Handle messages from content scripts and popup
 * - Store problem data and test cases
 * - Orchestrate code execution
 * - Manage extension state
 */

const JUDGE_API_URL = 'http://localhost:3000/api';

// Extension state
let currentProblem = null;
let executionInProgress = false;

/**
 * Check if local judge is running
 */
async function checkJudgeHealth() {
  try {
    const response = await fetch(`${JUDGE_API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    console.error('[CP-JUDGE] Judge health check failed:', error);
    return false;
  }
}

/**
 * Execute code on local judge
 */
async function executeCode(language, code, testCases, timeLimit = 2000) {
  if (executionInProgress) {
    throw new Error('Execution already in progress');
  }

  executionInProgress = true;

  try {
    console.log('[CP-JUDGE] Executing code...', { language, testCases: testCases.length });

    const response = await fetch(`${JUDGE_API_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language,
        code,
        testCases,
        timeLimit
      }),
      signal: AbortSignal.timeout(30000) // 30 second total timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('[CP-JUDGE] Execution completed:', result);

    return result;

  } catch (error) {
    console.error('[CP-JUDGE] Execution failed:', error);
    throw error;
  } finally {
    executionInProgress = false;
  }
}

/**
 * Get supported languages from judge
 */
async function getSupportedLanguages() {
  try {
    const response = await fetch(`${JUDGE_API_URL}/languages`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.languages || [];

  } catch (error) {
    console.error('[CP-JUDGE] Failed to get languages:', error);
    return ['cpp', 'java', 'python', 'javascript']; // Fallback
  }
}

/**
 * Store problem data
 */
async function storeProblem(problemData) {
  currentProblem = problemData;
  
  // Persist to storage
  await chrome.storage.local.set({
    currentProblem: problemData,
    lastUpdated: Date.now()
  });

  console.log('[CP-JUDGE] Problem stored:', problemData.name);
}

/**
 * Get current problem data
 */
async function getCurrentProblem() {
  if (currentProblem) {
    return currentProblem;
  }

  // Try to load from storage
  const data = await chrome.storage.local.get(['currentProblem']);
  if (data.currentProblem) {
    currentProblem = data.currentProblem;
    return currentProblem;
  }

  return null;
}

/**
 * Clear problem data
 */
async function clearProblem() {
  currentProblem = null;
  await chrome.storage.local.remove(['currentProblem', 'lastUpdated']);
  console.log('[CP-JUDGE] Problem cleared');
}

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[CP-JUDGE] Message received:', message.type);

  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'HEALTH_CHECK':
          const isHealthy = await checkJudgeHealth();
          sendResponse({ success: true, healthy: isHealthy });
          break;

        case 'GET_LANGUAGES':
          const languages = await getSupportedLanguages();
          sendResponse({ success: true, languages });
          break;

        case 'STORE_PROBLEM':
          await storeProblem(message.data);
          sendResponse({ success: true });
          break;

        case 'GET_PROBLEM':
          const problem = await getCurrentProblem();
          sendResponse({ success: true, problem });
          break;

        case 'CLEAR_PROBLEM':
          await clearProblem();
          sendResponse({ success: true });
          break;

        case 'EXECUTE_CODE':
          const result = await executeCode(
            message.language,
            message.code,
            message.testCases,
            message.timeLimit
          );
          sendResponse({ success: true, result });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[CP-JUDGE] Message handler error:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Unknown error'
      });
    }
  })();

  // Keep message channel open for async response
  return true;
});

/**
 * Extension installed/updated handler
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[CP-JUDGE] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    await chrome.storage.local.set({
      settings: {
        judgeUrl: 'http://localhost:3000',
        defaultLanguage: 'cpp',
        defaultTimeLimit: 2000,
        autoParseOnPageLoad: false
      }
    });

    // Open welcome page or instructions
    console.log('[CP-JUDGE] Welcome! Please start the local judge server.');
  }
});

/**
 * Command handler (keyboard shortcuts)
 */
chrome.commands.onCommand.addListener((command) => {
  console.log('[CP-JUDGE] Command received:', command);

  switch (command) {
    case 'run-tests':
      // Notify popup/content script to trigger test execution
      chrome.runtime.sendMessage({ type: 'TRIGGER_RUN' });
      break;

    case 'parse-problem':
      // Notify content script to parse problem
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'PARSE_PROBLEM' });
        }
      });
      break;
  }
});

console.log('[CP-JUDGE] Background service worker initialized');
