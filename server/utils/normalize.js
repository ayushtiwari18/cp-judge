/**
 * Output Normalization
 * 
 * RESPONSIBILITIES:
 * - Normalize whitespace for comparison
 * - Remove trailing newlines
 * - Handle platform-specific line endings
 * - Ensure consistent comparison logic
 * 
 * DESIGN PRINCIPLE:
 * - Competitive programming requires EXACT case matching
 * - Default to strict normalization (preserve case)
 * - Only normalize line endings and trailing whitespace
 */

/**
 * Strict normalization (CP-standard)
 * Preserves case sensitivity and internal whitespace structure
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
export function strictNormalizeOutput(output) {
  if (typeof output !== 'string') {
    return '';
  }

  return output
    .replace(/\r\n/g, '\n')          // Normalize Windows line endings
    .replace(/\r/g, '\n')            // Normalize old Mac line endings
    .replace(/[ \t]+$/gm, '')        // Remove trailing spaces per line
    .replace(/\n+$/g, '')            // Remove trailing newlines
    .trim();                          // Remove leading/trailing whitespace
}

/**
 * Aggressive normalization (for special cases only)
 * USE WITH CAUTION - Most CP problems require exact case
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
export function aggressiveNormalizeOutput(output) {
  if (typeof output !== 'string') {
    return '';
  }

  return output
    .trim()                           // Remove leading/trailing whitespace
    .replace(/\r\n/g, '\n')          // Normalize Windows line endings
    .replace(/\r/g, '\n')            // Normalize old Mac line endings
    .replace(/\n+$/g, '')            // Remove trailing newlines
    .replace(/[ \t]+$/gm, '')        // Remove trailing spaces per line
    .replace(/^[ \t]+/gm, '')        // Remove leading spaces per line
    .toLowerCase();                   // Case-insensitive (use carefully!)
}

/**
 * Legacy normalization (deprecated - use strictNormalizeOutput)
 * Kept for backwards compatibility but should not be used
 * @deprecated Use strictNormalizeOutput instead
 */
export function normalizeOutput(output) {
  console.warn('[DEPRECATED] normalizeOutput() is deprecated. Use strictNormalizeOutput() instead.');
  return strictNormalizeOutput(output);
}

/**
 * Compare two outputs with strict normalization (CP-standard)
 * @param {string} actual - Actual program output
 * @param {string} expected - Expected output
 * @returns {boolean} True if outputs match
 */
export function compareOutputs(actual, expected) {
  // 🚨 DEBUG LOGGING - CRITICAL FOR DIAGNOSING WA ISSUES
  console.log('\n========== OUTPUT COMPARISON ==========');
  console.log('EXPECTED (raw):', JSON.stringify(expected));
  console.log('ACTUAL (raw):', JSON.stringify(actual));
  
  const normalizedActual = strictNormalizeOutput(actual);
  const normalizedExpected = strictNormalizeOutput(expected);
  
  console.log('EXPECTED (normalized):', JSON.stringify(normalizedExpected));
  console.log('ACTUAL (normalized):', JSON.stringify(normalizedActual));
  console.log('MATCH:', normalizedActual === normalizedExpected);
  console.log('=======================================\n');
  
  return normalizedActual === normalizedExpected;
}

/**
 * Compare outputs with custom normalization function
 * @param {string} actual - Actual program output
 * @param {string} expected - Expected output
 * @param {function} normalizeFn - Normalization function to use
 * @returns {boolean} True if outputs match
 */
export function compareWithNormalizer(actual, expected, normalizeFn = strictNormalizeOutput) {
  const normalizedActual = normalizeFn(actual);
  const normalizedExpected = normalizeFn(expected);
  return normalizedActual === normalizedExpected;
}
