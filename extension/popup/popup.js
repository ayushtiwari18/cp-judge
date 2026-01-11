/**
 * CP Judge Popup Logic
 * 
 * RESPONSIBILITIES:
 * - Display problem information
 * - Manage test cases
 * - Handle code execution
 * - Show results with verdicts
 * - Communicate with background worker
 */

// DOM Elements
const judgeStatus = document.getElementById('judgeStatus');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const problemInfo = document.getElementById('problemInfo');
const languageSelect = document.getElementById('languageSelect');
const codeEditor = document.getElementById('codeEditor');
const testCases = document.getElementById('testCases');
const runBtn = document.getElementById('runBtn');
const resultsSection = document.getElementById('resultsSection');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const addTestBtn = document.getElementById('addTestBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');

// State
let currentProblem = null;
let currentTestCases = [];

/**
 * Initialize popup
 */
async function init() {
  console.log('[POPUP] Initializing...');
  
  // Check judge health
  await checkJudgeHealth();
  
  // Load problem data
  await loadProblem();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('[POPUP] Initialized successfully');
}

/**
 * Check if local judge is running
 */
async function checkJudgeHealth() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'HEALTH_CHECK' });
    
    if (response && response.success && response.healthy) {
      setJudgeStatus('healthy', 'Judge Running');
    } else {
      setJudgeStatus('unhealthy', 'Judge Offline');
    }
  } catch (error) {
    console.error('[POPUP] Health check failed:', error);
    setJudgeStatus('unhealthy', 'Judge Offline');
  }
}

/**
 * Set judge status UI
 */
function setJudgeStatus(status, text) {
  statusDot.className = `status-dot ${status}`;
  statusText.textContent = text;
}

/**
 * Load problem from storage
 */
async function loadProblem() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROBLEM' });
    
    if (response && response.success && response.problem) {
      currentProblem = response.problem;
      currentTestCases = response.problem.testCases || [];
      displayProblem();
      displayTestCases();
    } else {
      displayNoProblem();
    }
  } catch (error) {
    console.error('[POPUP] Failed to load problem:', error);
    displayNoProblem();
  }
}

/**
 * Display problem information
 */
function displayProblem() {
  problemInfo.innerHTML = `
    <div class="problem-name">${currentProblem.name}</div>
    <div class="problem-meta">
      <div class="meta-item">
        <span>⏱️</span>
        <span>${currentProblem.timeLimit}ms</span>
      </div>
      <div class="meta-item">
        <span>💾</span>
        <span>${currentProblem.memoryLimit}MB</span>
      </div>
      <div class="meta-item">
        <span>🎯</span>
        <span>${currentProblem.platform}</span>
      </div>
    </div>
  `;
}

/**
 * Display no problem message
 */
function displayNoProblem() {
  problemInfo.innerHTML = '<p class="no-problem">No problem parsed yet. Visit a problem page.</p>';
  testCases.innerHTML = '<p class="no-tests">No test cases available</p>';
}

/**
 * Display test cases
 */
function displayTestCases() {
  if (!currentTestCases || currentTestCases.length === 0) {
    testCases.innerHTML = '<p class="no-tests">No test cases available</p>';
    return;
  }

  testCases.innerHTML = currentTestCases.map((tc, index) => `
    <div class="test-case" data-index="${index}">
      <div class="test-case-header">
        <span class="test-case-number">Test Case ${index + 1}</span>
        <div class="test-case-actions">
          <button class="btn btn-small" onclick="editTestCase(${index})" title="Edit">
            ✏️
          </button>
          <button class="btn btn-small" onclick="deleteTestCase(${index})" title="Delete">
            🗑️
          </button>
        </div>
      </div>
      <div class="test-input">${escapeHtml(tc.input)}</div>
      <div class="test-output">${escapeHtml(tc.expectedOutput)}</div>
    </div>
  `).join('');
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Add new test case
 */
function addTestCase() {
  const input = prompt('Enter input:');
  if (input === null) return;
  
  const output = prompt('Enter expected output:');
  if (output === null) return;

  currentTestCases.push({
    input: input,
    expectedOutput: output
  });

  displayTestCases();
}

/**
 * Edit test case
 */
function editTestCase(index) {
  const tc = currentTestCases[index];
  
  const input = prompt('Enter input:', tc.input);
  if (input === null) return;
  
  const output = prompt('Enter expected output:', tc.expectedOutput);
  if (output === null) return;

  currentTestCases[index] = {
    input: input,
    expectedOutput: output
  };

  displayTestCases();
}

/**
 * Delete test case
 */
function deleteTestCase(index) {
  if (!confirm('Delete this test case?')) return;
  
  currentTestCases.splice(index, 1);
  displayTestCases();
}

/**
 * Run tests
 */
async function runTests() {
  const code = codeEditor.value.trim();
  const language = languageSelect.value;

  // Validation
  if (!code) {
    alert('Please enter your code');
    return;
  }

  if (!currentTestCases || currentTestCases.length === 0) {
    alert('No test cases available');
    return;
  }

  // Check judge health
  const healthResponse = await chrome.runtime.sendMessage({ type: 'HEALTH_CHECK' });
  if (!healthResponse || !healthResponse.healthy) {
    alert('Local judge is not running. Please start the server:\n\ncd server && npm start');
    return;
  }

  // Disable run button
  runBtn.disabled = true;
  runBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Running...</span>';

  try {
    // Execute code
    const response = await chrome.runtime.sendMessage({
      type: 'EXECUTE_CODE',
      language: language,
      code: code,
      testCases: currentTestCases,
      timeLimit: currentProblem?.timeLimit || 2000
    });

    if (response && response.success) {
      displayResults(response.result);
    } else {
      alert('Execution failed: ' + (response?.error || 'Unknown error'));
    }

  } catch (error) {
    console.error('[POPUP] Execution error:', error);
    alert('Execution failed: ' + error.message);
  } finally {
    // Re-enable run button
    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="btn-icon">▶️</span><span>Run Tests</span>';
  }
}

/**
 * Display execution results
 */
function displayResults(result) {
  resultsSection.style.display = 'block';

  // Check if compilation error
  if (result.compilationError) {
    results.innerHTML = `
      <div class="result-item CE">
        <div class="result-header">
          <span class="result-verdict CE">COMPILATION ERROR</span>
        </div>
        <div class="result-message">${result.compilationError.message}</div>
        <div class="result-output">${escapeHtml(result.compilationError.stderr || 'Compilation failed')}</div>
      </div>
    `;
    return;
  }

  // Display test results
  if (result.results && result.results.length > 0) {
    results.innerHTML = result.results.map(r => `
      <div class="result-item ${r.verdict}">
        <div class="result-header">
          <span class="result-verdict ${r.verdict}">Test ${r.testCase}: ${r.verdict}</span>
          <span class="result-time">${r.executionTime || 0}ms</span>
        </div>
        <div class="result-message">${r.message}</div>
        ${r.verdict === 'WA' || r.verdict === 'RE' ? `
          <div class="result-output">
            <strong>Expected:</strong>\n${escapeHtml(r.expectedOutput)}\n\n<strong>Got:</strong>\n${escapeHtml(r.actualOutput)}
          </div>
        ` : ''}
        ${r.stderr && r.stderr.trim() ? `
          <div class="result-output">
            <strong>Error:</strong>\n${escapeHtml(r.stderr)}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  runBtn.addEventListener('click', runTests);
  refreshBtn.addEventListener('click', loadProblem);
  addTestBtn.addEventListener('click', addTestCase);
  clearResultsBtn.addEventListener('click', () => {
    resultsSection.style.display = 'none';
    results.innerHTML = '';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runTests();
    }
  });

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TRIGGER_RUN') {
      runTests();
    }
  });
}

// Make functions globally accessible for onclick handlers
window.addTestCase = addTestCase;
window.editTestCase = editTestCase;
window.deleteTestCase = deleteTestCase;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Periodically check judge health
setInterval(checkJudgeHealth, 10000); // Every 10 seconds
