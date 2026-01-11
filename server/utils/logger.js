/**
 * Professional Logger Utility
 * 
 * RESPONSIBILITIES:
 * - Centralize all logging
 * - Respect DEBUG environment flag
 * - Clean production output
 * - Detailed debug information when needed
 * 
 * USAGE:
 * - Development: DEBUG=true npm start
 * - Production: npm start (DEBUG=false by default)
 */

const DEBUG = process.env.DEBUG === 'true';

/**
 * Log levels
 */
export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/**
 * Format timestamp for logs
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Core logging function
 */
function log(level, message, data = null) {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

/**
 * Info level - always shown
 */
export function info(message, data = null) {
  log(LogLevel.INFO, message, data);
}

/**
 * Warning level - always shown
 */
export function warn(message, data = null) {
  log(LogLevel.WARN, message, data);
}

/**
 * Error level - always shown
 */
export function error(message, data = null) {
  log(LogLevel.ERROR, message, data);
}

/**
 * Debug level - only in DEBUG mode
 */
export function debug(message, data = null) {
  if (DEBUG) {
    log(LogLevel.DEBUG, message, data);
  }
}

/**
 * Detailed debug with section markers
 */
export function debugSection(title, content) {
  if (!DEBUG) return;
  
  console.log('\n' + '='.repeat(50));
  console.log(`  ${title}`);
  console.log('='.repeat(50));
  if (typeof content === 'object') {
    console.log(JSON.stringify(content, null, 2));
  } else {
    console.log(content);
  }
  console.log('='.repeat(50) + '\n');
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode() {
  return DEBUG;
}

/**
 * Simple logger without timestamp (for clean output)
 */
export function simple(message) {
  console.log(message);
}

/**
 * Log execution metrics (always shown but concise)
 */
export function metric(label, value, unit = '') {
  console.log(`[METRIC] ${label}: ${value}${unit}`);
}

export default {
  info,
  warn,
  error,
  debug,
  debugSection,
  isDebugMode,
  simple,
  metric,
  LogLevel
};
