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

  console.log('[CF-SCRAPER] Codeforces scraper initialized');

  /**
   * Extract problem name
   */
  function getProblemName() {
    // Try different selectors
    const selectors = [
      '.problem-statement > .header > .title',
      '.problem-statement .title',
      'div.header div.title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    // Fallback to page title
    const titleMatch = document.title.match(/Problem - (.+)/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    return 'Unknown Problem';
  }

  /**
   * Extract time limit
   */
  function getTimeLimit() {
    const timeLimitElement = document.querySelector('.time-limit');
    if (!timeLimitElement) return 2000; // Default 2 seconds

    const text = timeLimitElement.textContent;
    const match = text.match(/([0-9.]+)\s*(second|millisecond)/i);
    
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit === 'second' || unit === 'seconds') {
        return value * 1000; // Convert to milliseconds
      }
      return value;
    }

    return 2000; // Default
  }

  /**
   * Extract memory limit
   */
  function getMemoryLimit() {
    const memoryLimitElement = document.querySelector('.memory-limit');
    if (!memoryLimitElement) return 256; // Default 256 MB

    const text = memoryLimitElement.textContent;
    const match = text.match(/([0-9]+)\s*(megabyte|MB)/i);
    
    if (match) {
      return parseInt(match[1]);
    }

    return 256; // Default
  }

  /**
   * Extract test cases from sample tests
   */
  function extractTestCases() {
    const testCases = [];

    // Method 1: Use .sample-test structure
    const sampleTest = document.querySelector('.sample-test');
    if (sampleTest) {
      const inputs = sampleTest.querySelectorAll('.input pre');
      const outputs = sampleTest.querySelectorAll('.output pre');

      const count = Math.min(inputs.length, outputs.length);
      
      for (let i = 0; i < count; i++) {
        const input = inputs[i].textContent.trim();
        const output = outputs[i].textContent.trim();
        
        testCases.push({
          input: input,
          expectedOutput: output
        });
      }
    }

    // Method 2: Fallback - find all input/output sections
    if (testCases.length === 0) {
      const allInputs = document.querySelectorAll('div.input pre');
      const allOutputs = document.querySelectorAll('div.output pre');

      const count = Math.min(allInputs.length, allOutputs.length);
      
      for (let i = 0; i < count; i++) {
        const input = allInputs[i].textContent.trim();
        const output = allOutputs[i].textContent.trim();
        
        testCases.push({
          input: input,
          expectedOutput: output
        });
      }
    }

    console.log('[CF-SCRAPER] Extracted test cases:', testCases.length);
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
    chrome.runtime.sendMessage({
      type: 'STORE_PROBLEM',
      data: problemData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[CF-SCRAPER] Failed to send problem:', chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        console.log('[CF-SCRAPER] Problem sent successfully');
        showNotification('Problem parsed successfully!', 'success');
      } else {
        console.error('[CF-SCRAPER] Failed to store problem');
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
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Add CSS animations
   */
  const style = document.createElement('style');
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

  /**
   * Listen for messages from background/popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PARSE_PROBLEM') {
      const problemData = parseProblem();
      sendProblemData(problemData);
      sendResponse({ success: true, problem: problemData });
    }
    return true;
  });

  /**
   * Auto-parse on page load (if enabled in settings)
      */
  chrome.storage.local.get(['settings'], (data) => {
    const settings = data.settings || {};
    
    if (settings.autoParseOnPageLoad) {
      // Wait for page to fully load
      if (document.readyState === 'complete') {
        const problemData = parseProblem();
        sendProblemData(problemData);
      } else {
        window.addEventListener('load', () => {
          const problemData = parseProblem();
          sendProblemData(problemData);
        });
      }
    }
  });

  console.log('[CF-SCRAPER] Ready to parse Codeforces problems');
})();
