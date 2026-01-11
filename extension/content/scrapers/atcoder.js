/**
 * AtCoder Problem Scraper
 */

(function() {
  'use strict';

  console.log('[AC-SCRAPER] AtCoder scraper initialized');

  function getProblemName() {
    const titleElement = document.querySelector('.h2');
    return titleElement ? titleElement.textContent.trim() : 'AtCoder Problem';
  }

  function getTimeLimit() {
    const timeLimitElement = document.querySelector('p:contains("Time Limit")');
    if (timeLimitElement) {
      const match = timeLimitElement.textContent.match(/([0-9.]+)\s*sec/);
      if (match) {
        return parseFloat(match[1]) * 1000;
      }
    }
    return 2000;
  }

  function extractTestCases() {
    const testCases = [];
    
    const preSections = document.querySelectorAll('pre');
    
    for (let i = 0; i < preSections.length; i += 2) {
      if (i + 1 < preSections.length) {
        const input = preSections[i].textContent.trim();
        const output = preSections[i + 1].textContent.trim();
        
        if (input && output) {
          testCases.push({ input, expectedOutput: output });
        }
      }
    }

    return testCases;
  }

  function parseProblem() {
    const problemData = {
      platform: 'atcoder',
      name: getProblemName(),
      url: window.location.href,
      timeLimit: getTimeLimit(),
      memoryLimit: 256,
      testCases: extractTestCases(),
      timestamp: Date.now()
    };

    console.log('[AC-SCRAPER] Problem parsed:', problemData);
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

  console.log('[AC-SCRAPER] Ready');
})();
