// 🔥 INJECTION VERIFICATION - DO NOT REMOVE
console.log('🔥 CP Judge content script INJECTED on:', window.location.href);

/**
 * Codeforces Problem Scraper - Professional Edition
 * 
 * RESPONSIBILITIES:
 * - Extract problem metadata (name, limits)
 * - Parse sample test cases from DOM
 * - Intelligently reconstruct condensed test formats
 * - Handle multi-test case patterns automatically
 * - Send properly formatted data to background worker
 * 
 * SUPPORTED URLS:
 * - codeforces.com/problemset/problem/{contest}/{problem}
 * - codeforces.com/contest/{contest}/problem/{problem}
 * - codeforces.com/gym/{gym}/problem/{problem}
 * 
 * KEY FEATURE:
 * Automatically detects and fixes condensed test case formats
 * where Codeforces displays all input on a single line
 */

(function() {
  'use strict';

  console.log('[CF-SCRAPER] ✨ Professional scraper initializing...');

  /**
   * Extract problem name
   */
  function getProblemName() {
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
      return 2000;
    }

    const text = timeLimitElement.textContent;
    const match = text.match(/([0-9.]+)\s*(second|millisecond)/i);
    
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return unit.includes('second') ? value * 1000 : value;
    }

    return 2000;
  }

  /**
   * Extract memory limit
   */
  function getMemoryLimit() {
    const memoryLimitElement = document.querySelector('.memory-limit');
    if (!memoryLimitElement) {
      return 256;
    }

    const text = memoryLimitElement.textContent;
    const match = text.match(/([0-9]+)\s*(megabyte|MB)/i);
    
    if (match) {
      return parseInt(match[1]);
    }

    return 256;
  }

  /**
   * Extract text from pre element preserving newlines
   */
  function extractPreContent(preElement) {
    if (!preElement) return '';
    
    let text = preElement.textContent || preElement.innerText || '';
    text = text.replace(/^\s+|\s+$/g, '');
    
    return text;
  }

  /**
   * Analyze problem statement to understand input format
   * This is the KEY function for handling condensed formats
   */
  function analyzeInputFormat() {
    const inputSection = document.querySelector('.input-specification');
    if (!inputSection) {
      console.log('[CF-SCRAPER] No input specification found');
      return null;
    }

    const text = inputSection.textContent;
    console.log('[CF-SCRAPER] 🔍 Analyzing input format...');

    // Check if it's a multi-test case problem
    const multiTestPattern = /first line contains.*?integer.*?t.*?number of test cases/i;
    const isMultiTest = multiTestPattern.test(text);

    if (isMultiTest) {
      console.log('[CF-SCRAPER] ✅ Detected multi-test case format');
      
      // Try to detect the structure of each test case
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Common patterns:
      // "The first line of each test case contains..."
      // "The second line of each test case contains..."
      const linesPerTest = [];
      
      for (const line of lines) {
        if (line.match(/first line of each test case/i)) {
          linesPerTest.push('first');
        } else if (line.match(/second line of each test case/i)) {
          linesPerTest.push('second');
        }
      }

      return {
        isMultiTest: true,
        linesPerTestCase: linesPerTest.length > 0 ? linesPerTest.length : 2, // default to 2 lines
        hasT: true
      };
    }

    return {
      isMultiTest: false,
      linesPerTestCase: 0,
      hasT: false
    };
  }

  /**
   * Reconstruct proper test case format from condensed input
   * CORE INTELLIGENCE: Converts "1 2 3 4 5 6" → proper multi-line format
   */
  function reconstructTestCase(rawInput, rawOutput, format) {
    console.log('[CF-SCRAPER] 🔧 Attempting to reconstruct test case...');
    console.log('[CF-SCRAPER] Raw input preview:', rawInput.substring(0, 100));
    console.log('[CF-SCRAPER] Format detected:', format);

    // If already multi-line, return as-is
    if (rawInput.includes('\n')) {
      console.log('[CF-SCRAPER] ✅ Input already has newlines, using as-is');
      return { input: rawInput, output: rawOutput };
    }

    // If no format detected, return as-is
    if (!format || !format.isMultiTest) {
      console.log('[CF-SCRAPER] ⚠️ No multi-test format detected, using raw input');
      return { input: rawInput, output: rawOutput };
    }

    // Split raw input into tokens
    const tokens = rawInput.trim().split(/\s+/);
    console.log('[CF-SCRAPER] Total tokens:', tokens.length);

    // Count expected outputs to determine number of test cases
    const outputLines = rawOutput.trim().split('\n');
    const numTests = outputLines.length;
    console.log('[CF-SCRAPER] Expected test cases (from output):', numTests);

    // Check if first token is the number of test cases
    const firstToken = parseInt(tokens[0]);
    if (firstToken === numTests) {
      console.log('[CF-SCRAPER] ✅ First token matches test count - reconstructing...');
      
      // Reconstruct format
      const reconstructed = [tokens[0]]; // First line is 't'
      let idx = 1;
      
      const linesPerTest = format.linesPerTestCase || 2;
      
      for (let test = 0; test < numTests; test++) {
        for (let line = 0; line < linesPerTest; line++) {
          if (idx >= tokens.length) break;
          
          if (line === 0) {
            // First line of test: usually n and k (2 integers)
            const lineTokens = [];
            lineTokens.push(tokens[idx++]);
            if (idx < tokens.length) lineTokens.push(tokens[idx++]);
            reconstructed.push(lineTokens.join(' '));
          } else {
            // Second line: n integers (array)
            const n = parseInt(tokens[idx - 2]); // n from previous line
            const lineTokens = [];
            for (let i = 0; i < n && idx < tokens.length; i++) {
              lineTokens.push(tokens[idx++]);
            }
            reconstructed.push(lineTokens.join(' '));
          }
        }
      }

      const result = reconstructed.join('\n');
      console.log('[CF-SCRAPER] ✅ Reconstruction successful!');
      console.log('[CF-SCRAPER] Reconstructed lines:', reconstructed.length);
      console.log('[CF-SCRAPER] Preview:', result.substring(0, 200));
      
      return {
        input: result,
        output: rawOutput
      };
    }

    // Fallback: return raw
    console.log('[CF-SCRAPER] ⚠️ Could not reconstruct, using raw input');
    return { input: rawInput, output: rawOutput };
  }

  /**
   * Extract test cases from sample tests with intelligent parsing
   */
  function extractTestCases() {
    const testCases = [];
    console.log('[CF-SCRAPER] 📝 Starting test case extraction...');

    // First, analyze the input format
    const format = analyzeInputFormat();

    const sampleTest = document.querySelector('.sample-test');
    if (sampleTest) {
      console.log('[CF-SCRAPER] Found .sample-test container');
      
      const inputs = sampleTest.querySelectorAll('.input pre');
      const outputs = sampleTest.querySelectorAll('.output pre');

      console.log('[CF-SCRAPER] Found inputs:', inputs.length, 'outputs:', outputs.length);

      const count = Math.min(inputs.length, outputs.length);
      
      for (let i = 0; i < count; i++) {
        const rawInput = extractPreContent(inputs[i]);
        const rawOutput = extractPreContent(outputs[i]);
        
        // Apply intelligent reconstruction
        const reconstructed = reconstructTestCase(rawInput, rawOutput, format);
        
        testCases.push({
          input: reconstructed.input,
          expectedOutput: reconstructed.output
        });
        
        console.log('[CF-SCRAPER] Test case', i + 1, ':', {
          inputLines: reconstructed.input.split('\n').length,
          outputLines: reconstructed.output.split('\n').length,
          wasReconstructed: rawInput !== reconstructed.input
        });
      }
    }

    // Fallback method
    if (testCases.length === 0) {
      console.log('[CF-SCRAPER] Trying fallback method...');
      
      const allInputs = document.querySelectorAll('div.input pre, .input pre');
      const allOutputs = document.querySelectorAll('div.output pre, .output pre');

      const count = Math.min(allInputs.length, allOutputs.length);
      
      for (let i = 0; i < count; i++) {
        const rawInput = extractPreContent(allInputs[i]);
        const rawOutput = extractPreContent(allOutputs[i]);
        
        const reconstructed = reconstructTestCase(rawInput, rawOutput, format);
        
        testCases.push({
          input: reconstructed.input,
          expectedOutput: reconstructed.output
        });
      }
    }

    console.log('[CF-SCRAPER] ✅ Total test cases extracted:', testCases.length);
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
    console.log('[CF-SCRAPER] 🚀 Parsing problem...');
    
    const problemData = {
      platform: 'codeforces',
      name: getProblemName(),
      url: getProblemUrl(),
      timeLimit: getTimeLimit(),
      memoryLimit: getMemoryLimit(),
      testCases: extractTestCases(),
      timestamp: Date.now()
    };

    console.log('[CF-SCRAPER] ✅ Problem parsed successfully:', problemData);
    return problemData;
  }

  /**
   * Send problem data to background worker
   */
  function sendProblemData(problemData) {
    console.log('[CF-SCRAPER] 📤 Sending problem data to background...');
    
    chrome.runtime.sendMessage({
      type: 'STORE_PROBLEM',
      data: problemData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[CF-SCRAPER] ❌ Failed to send problem:', chrome.runtime.lastError);
        showNotification('Failed to parse problem: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      if (response && response.success) {
        console.log('[CF-SCRAPER] ✅ Problem sent successfully');
        showNotification(`✅ Parsed: ${problemData.name}\n${problemData.testCases.length} test cases found`, 'success');
      } else {
        console.error('[CF-SCRAPER] ❌ Failed to store problem:', response);
        showNotification('Failed to parse problem', 'error');
      }
    });
  }

  /**
   * Show notification to user
   */
  function showNotification(message, type = 'info') {
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
    console.log('[CF-SCRAPER] 📬 Received message:', message.type);
    
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
    console.log('[CF-SCRAPER] 🕐 Checking if page is ready for parsing...');
    
    if (document.readyState === 'loading') {
      console.log('[CF-SCRAPER] ⏳ Waiting for DOM to load...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[CF-SCRAPER] ✅ DOM loaded, parsing in 1 second...');
        setTimeout(attemptAutoParse, 1000);
      });
    } else {
      console.log('[CF-SCRAPER] ✅ DOM already loaded, parsing in 1 second...');
      setTimeout(attemptAutoParse, 1000);
    }
  }

  /**
   * Attempt to auto-parse problem
   */
  function attemptAutoParse() {
    if (!window.location.href.includes('/problem/')) {
      console.log('[CF-SCRAPER] ⚠️ Not a problem page, skipping auto-parse');
      return;
    }

    console.log('[CF-SCRAPER] 🚀 Attempting auto-parse...');
    
    const problemStatement = document.querySelector('.problem-statement');
    if (!problemStatement) {
      console.log('[CF-SCRAPER] ⚠️ Problem statement not found, retrying in 2 seconds...');
      setTimeout(attemptAutoParse, 2000);
      return;
    }

    const problemData = parseProblem();
    if (problemData.testCases.length > 0) {
      sendProblemData(problemData);
    } else {
      console.warn('[CF-SCRAPER] ⚠️ No test cases found, waiting 2 more seconds...');
      setTimeout(() => {
        const retryData = parseProblem();
        sendProblemData(retryData);
      }, 2000);
    }
  }

  // Initialize auto-parse
  initAutoParse();

  console.log('[CF-SCRAPER] ✨ Professional scraper ready with intelligent parsing');
})();