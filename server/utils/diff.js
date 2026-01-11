/**
 * Diff Generator for Wrong Answer Cases
 * 
 * RESPONSIBILITIES:
 * - Generate line-by-line diff between expected and actual output
 * - Highlight differences clearly
 * - Show missing/extra lines
 * - Provide character-level diff for mismatched lines
 * 
 * OUTPUT FORMAT:
 * - Line X: Expected "abc" but got "def"
 * - Line Y: Missing (expected "xyz")
 * - Line Z: Extra (got "123")
 */

/**
 * Generate human-readable diff
 * @param {string} expected - Expected output
 * @param {string} actual - Actual output
 * @returns {object} Diff information
 */
export function generateDiff(expected, actual) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  
  const maxLines = Math.max(expectedLines.length, actualLines.length);
  const differences = [];
  
  for (let i = 0; i < maxLines; i++) {
    const expectedLine = expectedLines[i] !== undefined ? expectedLines[i] : null;
    const actualLine = actualLines[i] !== undefined ? actualLines[i] : null;
    
    if (expectedLine === null) {
      // Extra line in actual output
      differences.push({
        lineNumber: i + 1,
        type: 'extra',
        expected: null,
        actual: actualLine,
        message: `Line ${i + 1}: Extra line (got "${actualLine}")`
      });
    } else if (actualLine === null) {
      // Missing line in actual output
      differences.push({
        lineNumber: i + 1,
        type: 'missing',
        expected: expectedLine,
        actual: null,
        message: `Line ${i + 1}: Missing (expected "${expectedLine}")`
      });
    } else if (expectedLine !== actualLine) {
      // Different line
      const charDiff = getCharacterDiff(expectedLine, actualLine);
      differences.push({
        lineNumber: i + 1,
        type: 'different',
        expected: expectedLine,
        actual: actualLine,
        message: `Line ${i + 1}: Expected "${expectedLine}" but got "${actualLine}"`,
        characterDiff: charDiff
      });
    }
  }
  
  return {
    hasDifferences: differences.length > 0,
    totalLines: maxLines,
    differenceCount: differences.length,
    differences: differences,
    summary: generateSummary(differences)
  };
}

/**
 * Get character-level diff for a line
 * @param {string} expected - Expected line
 * @param {string} actual - Actual line
 * @returns {object} Character diff info
 */
function getCharacterDiff(expected, actual) {
  // Find first difference position
  let firstDiff = -1;
  const minLen = Math.min(expected.length, actual.length);
  
  for (let i = 0; i < minLen; i++) {
    if (expected[i] !== actual[i]) {
      firstDiff = i;
      break;
    }
  }
  
  // If no char difference found but lengths differ
  if (firstDiff === -1 && expected.length !== actual.length) {
    firstDiff = minLen;
  }
  
  return {
    position: firstDiff,
    expectedLength: expected.length,
    actualLength: actual.length,
    lengthDifference: actual.length - expected.length
  };
}

/**
 * Generate human-readable summary
 * @param {array} differences - Array of differences
 * @returns {string} Summary text
 */
function generateSummary(differences) {
  if (differences.length === 0) {
    return 'Outputs match perfectly';
  }
  
  const counts = {
    missing: 0,
    extra: 0,
    different: 0
  };
  
  differences.forEach(diff => {
    counts[diff.type]++;
  });
  
  const parts = [];
  if (counts.different > 0) parts.push(`${counts.different} different line(s)`);
  if (counts.missing > 0) parts.push(`${counts.missing} missing line(s)`);
  if (counts.extra > 0) parts.push(`${counts.extra} extra line(s)`);
  
  return parts.join(', ');
}

/**
 * Format diff for console display
 * @param {object} diff - Diff object from generateDiff
 * @returns {string} Formatted diff text
 */
export function formatDiffForConsole(diff) {
  if (!diff.hasDifferences) {
    return 'No differences found';
  }
  
  const lines = [
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  DIFF ANALYSIS',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Summary: ${diff.summary}`,
    ''
  ];
  
  diff.differences.forEach(d => {
    lines.push(d.message);
    if (d.type === 'different' && d.characterDiff.position >= 0) {
      lines.push(`  → First difference at character ${d.characterDiff.position}`);
    }
  });
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format diff for JSON API response
 * @param {object} diff - Diff object from generateDiff
 * @returns {object} Formatted diff for API
 */
export function formatDiffForAPI(diff) {
  return {
    hasDifferences: diff.hasDifferences,
    summary: diff.summary,
    totalDifferences: diff.differenceCount,
    differences: diff.differences.map(d => ({
      line: d.lineNumber,
      type: d.type,
      expected: d.expected,
      actual: d.actual,
      message: d.message
    }))
  };
}

export default {
  generateDiff,
  formatDiffForConsole,
  formatDiffForAPI
};
