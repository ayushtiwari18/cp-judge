/**
 * Codeforces Problem Scraper
 * 
 * RESPONSIBILITIES:
 * - Extract problem metadata (name, limits)
 * - Parse sample test cases from DOM
 * - Detect programming language context
 * - Send problem data to background worker
 * 
 * SUPPORTED URLS:
 * - codeforces.com/problemset/problem/{contest}/{problem}
 * - codeforces.com/contest/{contest}/problem/{problem}
 * - codeforces.com/gym/{gym}/problem/{problem}
 */

(function() {
  'use strict';

  console.log('[CF-SCRAPER] Codeforces scraper initialized on:', window.location.href);

  /**
   * Extract problem name
   */
  function getProblemName() {
    // Try multiple selectors
    const selectors = [
      '.problem-statement > .header > .title',
      '.problem-statement .title',
      'div.header div.title',
      '.title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const name = element.textContent.trim();
        console.log('[CF-SCRAPER] Found problem name:', name);
        return name;
      }
    }

    // Fallback to page title
    const titleMatch = document.title.match(/Problem - (.+)/);
    if (titleMatch) {
      console.log('[CF-SCRAPER] Problem name from title:', titleMatch[1]);
      return titleMatch[1].trim();
    }

    console.warn('[CF-SCRAPER] Could not find problem name');
    return 'Codeforces Problem';
  }

  /**
   * Extract time limit
   */
  function getTimeLimit() {
    const timeLimitElement = document.querySelector('.time-limit');
    if (!timeLimitElement) {
      console.log('[CF-SCRAPER] Time limit not found, using default 2000ms');
      return 2000;
    }

    const text = timeLimitElement.textContent;
    const match = text.match(/([0-9.]+)\s*(second|millisecond)/i);
    
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('second')) {
        console.log('[CF-SCRAPER] Time limit:', value, 'seconds');
        return value * 1000; // Convert to milliseconds
      }
      console.log('[CF-SCRAPER] Time limit:', value, 'milliseconds');
      return value;
    }

    console.log('[CF-SCRAPER] Could not parse time limit, using default 2000ms');
    return 2000;
  }

  /**
   * Extract memory limit
   */
  function getMemoryLimit() {
    const memoryLimitElement = document.querySelector('.memory-limit');
    if (!memoryLimitElement) {
      console.log('[CF-SCRAPER] Memory limit not found, using default 256MB');
      return 256;
    }

    const text = memoryLimitElement.textContent;
    const match = text.match(/([0-9]+)\s*(megabyte|MB)/i);
    
    if (match) {
      const value = parseInt(match[1]);
      console.log('[CF-SCRAPER] Memory limit:', value, 'MB');
      return value;
    }

    console.log('[CF-SCRAPER] Could not parse memory limit, using default 256MB');
    return 256;
  }

  /**
   * Extract text from pre element preserving newlines
   */
  function extractPreContent(preElement) {
    if (!preElement) return '';
    
    // Get the text content, preserving newlines
    let text = preElement.textContent || preElement.innerText || '';
    
    // Trim only leading/trailing whitespace, keep internal newlines
    text = text.replace(/^\s+|\s+$/g, '');
    
    console.log('[CF-SCRAPER] Extracted pre content:', {
      length: text.length,
      lines: text.split('\n').length,
      preview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
    
    return text;
  }

  /**
   * Extract test cases from sample tests
   */
  function extractTestCases() {
    const testCases = [];

    console.log('[CF-SCRAPER] Starting test case extraction...');

    // Method 1: Use .sample-test structure (most common)
    const sampleTest = document.querySelector('.sample-test');
    if (sampleTest) {
      console.log('[CF-SCRAPER] Found .sample-test container');
      
      const inputs = sampleTest.querySelectorAll('.input pre');
      const outputs = sampleTest.querySelectorAll('.output pre');

      console.log('[CF-SCRAPER] Found inputs:', inputs.length, 'outputs:', outputs.length);

      const count = Math.min(inputs.length, outputs.length);
      
      for (let i = 0; i < count; i++) {
        const input = extractPreContent(inputs[i]);
        const output = extractPreContent(outputs[i]);
        
        if (input || output) { // Accept even if one is empty
          testCases.push({
            input: input,
            expectedOutput: output
          });
          console.log('[CF-SCRAPER] Test case', i + 1, ':', {
            inputLines: input.split('\n').length,
            outputLines: output.split('\n').length,
            inputLength: input.length,
            outputLength: output.length
          });
        }
      }
    }

    // Method 2: Fallback - find all input/output sections
    if (testCases.length === 0) {
      console.log('[CF-SCRAPER] Trying fallback method...');
      
      const allInputs = document.querySelectorAll('div.input pre, .input pre');
      const allOutputs = document.querySelectorAll('div.output pre, .output pre');

      console.log('[CF-SCRAPER] Fallback - Found inputs:', allInputs.length, 'outputs:', allOutputs.length);

      const count = Math.min(allInputs.length, allOutputs.length);
      
      for (let i = 0; i < count; i++) {
        const input = extractPreContent(allInputs[i]);
        const output = extractPreContent(allOutputs[i]);
        
        if (input || output) {
          testCases.push({
            input: input,
            expectedOutput: output
          });
          console.log('[CF-SCRAPER] Fallback test case', i + 1, 'added');
        }
      }
    }

    console.log('[CF-SCRAPER] Total test cases extracted:', testCases.length);
    return testCases;
  }

  /**
   * Get problem URL
   */
  function getProblemUrl() {
    return window.location.href;
  }

  /**
   * Parse problem data
   */
  function parseProblem() {
    console.log('[CF-SCRAPER] Parsing problem...');
    
    const problemData = {
      platform: 'codeforces',
      name: getProblemName(),
      url: getProblemUrl(),
      timeLimit: getTimeLimit(),
      memoryLimit: getMemoryLimit(),
      testCases: extractTestCases(),
      timestamp: Date.now()
    };

    console.log('[CF-SCRAPER] Problem parsed:', problemData);
    return problemData;
  }

  /**
   * Send problem data to background worker
   */
  function sendProblemData(problemData) {
    console.log('[CF-SCRAPER] Sending problem data to background...');
    
    chrome.runtime.sendMessage({
      type: 'STORE_PROBLEM',
      data: problemData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[CF-SCRAPER] Failed to send problem:', chrome.runtime.lastError);
        showNotification('Failed to parse problem: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      if (response && response.success) {
        console.log('[CF-SCRAPER] Problem sent successfully');
        showNotification(`✅ Parsed: ${problemData.name}\n${problemData.testCases.length} test cases found`, 'success');
      } else {
        console.error('[CF-SCRAPER] Failed to store problem:', response);
        showNotification('Failed to parse problem', 'error');
      }
    });
  }

  /**
   * Show notification to user
   */
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cp-judge-notification cp-judge-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      max-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  /**
   * Add CSS animations
   */
  if (!document.getElementById('cp-judge-styles')) {
    const style = document.createElement('style');
    style.id = 'cp-judge-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Listen for messages from background/popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[CF-SCRAPER] Received message:', message.type);
    
    if (message.type === 'PARSE_PROBLEM') {
      const problemData = parseProblem();
      sendProblemData(problemData);
      sendResponse({ success: true, problem: problemData });
    }
    return true;
  });

  /**
   * Wait for page to load, then auto-parse
   */
  function initAutoParse() {
    console.log('[CF-SCRAPER] Checking if page is ready for parsing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      console.log('[CF-SCRAPER] Waiting for DOM to load...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[CF-SCRAPER] DOM loaded, parsing in 1 second...');
        setTimeout(attemptAutoParse, 1000);
      });
    } else {
      console.log('[CF-SCRAPER] DOM already loaded, parsing in 1 second...');
      setTimeout(attemptAutoParse, 1000);
    }
  }

  /**
   * Attempt to auto-parse problem
   */
  function attemptAutoParse() {
    // Check if we're on a problem page
    if (!window.location.href.includes('/problem/')) {
      console.log('[CF-SCRAPER] Not a problem page, skipping auto-parse');
      return;
    }

    console.log('[CF-SCRAPER] Attempting auto-parse...');
    
    // Check if problem content exists
    const problemStatement = document.querySelector('.problem-statement');
    if (!problemStatement) {
      console.log('[CF-SCRAPER] Problem statement not found, retrying in 2 seconds...');
      setTimeout(attemptAutoParse, 2000);
      return;
    }

    // Parse and send
    const problemData = parseProblem();
    if (problemData.testCases.length > 0) {
      sendProblemData(problemData);
    } else {
      console.warn('[CF-SCRAPER] No test cases found, waiting 2 more seconds...');
      setTimeout(() => {
        const retryData = parseProblem();
        sendProblemData(retryData);
      }, 2000);
    }
  }

  // Initialize auto-parse
  initAutoParse();

  console.log('[CF-SCRAPER] Ready to parse Codeforces problems');
})();
