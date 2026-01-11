/**
 * Output Normalization
 * 
 * RESPONSIBILITIES:
 * - Normalize whitespace for comparison
 * - Remove trailing newlines
 * - Handle platform-specific line endings
 * - Ensure consistent comparison logic
 */

/**
 * Normalize output for comparison
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
export function normalizeOutput(output) {
  if (typeof output !== 'string') {
    return '';
  }

  return output
    .trim()                           // Remove leading/trailing whitespace
    .replace(/\r\n/g, '\n')          // Normalize Windows line endings
    .replace(/\r/g, '\n')            // Normalize old Mac line endings
    .replace(/\n+$/g, '')            // Remove trailing newlines
    .replace(/[ \t]+$/gm, '')        // Remove trailing spaces per line
    .replace(/^[ \t]+/gm, '')        // Remove leading spaces per line (optional)
    .toLowerCase();                   // Case-insensitive comparison (optional)
}

/**
 * Strict normalization (preserves more structure)
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
export function strictNormalizeOutput(output) {
  if (typeof output !== 'string') {
    return '';
  }

  return output
    .replace(/\r\n/g, '\n')          // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n+$/g, '')            // Remove trailing newlines only
    .trim();
}

/**
 * Compare two outputs with normalization
 * @param {string} actual - Actual program output
 * @param {string} expected - Expected output
 * @returns {boolean} True if outputs match
 */
export function compareOutputs(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected;
}
