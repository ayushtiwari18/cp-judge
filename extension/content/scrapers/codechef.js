/**
 * CodeChef Problem Scraper
 */

(function() {
  'use strict';

  console.log('[CC-SCRAPER] CodeChef scraper initialized');

  function getProblemName() {
    const titleElement = document.querySelector('.problem-heading');
    return titleElement ? titleElement.textContent.trim() : 'CodeChef Problem';
  }

  function extractTestCases() {
    const testCases = [];
    
    const inputSections = document.querySelectorAll('pre[id*="sampleInput"], pre.sample_input');
    const outputSections = document.querySelectorAll('pre[id*="sampleOutput"], pre.sample_output');

    const count = Math.min(inputSections.length, outputSections.length);
    
    for (let i = 0; i < count; i++) {
      const input = inputSections[i].textContent.trim();
      const output = outputSections[i].textContent.trim();
      
      if (input && output) {
        testCases.push({ input, expectedOutput: output });
      }
    }

    return testCases;
  }

  function parseProblem() {
    const problemData = {
      platform: 'codechef',
      name: getProblemName(),
      url: window.location.href,
      timeLimit: 2000,
      memoryLimit: 256,
      testCases: extractTestCases(),
      timestamp: Date.now()
    };

    console.log('[CC-SCRAPER] Problem parsed:', problemData);
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

  console.log('[CC-SCRAPER] Ready');
})();
