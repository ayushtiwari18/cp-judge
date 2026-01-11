/**
 * LeetCode Problem Scraper
 * 
 * Note: LeetCode uses dynamic content loading
 * This is a basic implementation that may need updates
 */

(function() {
  'use strict';

  console.log('[LC-SCRAPER] LeetCode scraper initialized');

  function parseProblem() {
    // LeetCode structure is complex and dynamic
    // This is a simplified version
    
    const problemTitle = document.querySelector('[data-cy="question-title"]')?.textContent?.trim() ||
                        document.querySelector('div[class*="title"]')?.textContent?.trim() ||
                        'LeetCode Problem';

    // LeetCode doesn't expose test cases directly
    // Users will need to add them manually
    
    const problemData = {
      platform: 'leetcode',
      name: problemTitle,
      url: window.location.href,
      timeLimit: 2000, // Default
      memoryLimit: 256,
      testCases: [], // LeetCode doesn't show all test cases
      timestamp: Date.now()
    };

    console.log('[LC-SCRAPER] Problem parsed:', problemData);
    return problemData;
  }

  function sendProblemData(problemData) {
    chrome.runtime.sendMessage({
      type: 'STORE_PROBLEM',
      data: problemData
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PARSE_PROBLEM') {
      const problemData = parseProblem();
      sendProblemData(problemData);
      sendResponse({ success: true, problem: problemData });
    }
    return true;
  });

  console.log('[LC-SCRAPER] Ready');
})();
