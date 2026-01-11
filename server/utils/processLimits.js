/**
 * Process Safety & Resource Limits
 * 
 * RESPONSIBILITIES:
 * - Enforce memory limits
 * - Prevent network access (preparation)
 * - Kill runaway processes
 * - Ensure safe local execution
 * 
 * SECURITY MODEL:
 * - Workspace isolation (already done)
 * - Resource limits (this module)
 * - No filesystem escape
 * - No network access
 */

import os from 'os';
import { warn } from './logger.js';

/**
 * Get platform-specific resource limit commands
 * @param {number} memoryLimitMB - Memory limit in MB
 * @returns {object} Platform-specific limit configuration
 */
export function getResourceLimits(memoryLimitMB = 256) {
  const platform = os.platform();
  
  // Convert MB to bytes for ulimit
  const memoryLimitKB = memoryLimitMB * 1024;
  
  switch (platform) {
    case 'linux':
    case 'darwin': // macOS
      return {
        supported: true,
        prefix: 'ulimit',
        command: `ulimit -v ${memoryLimitKB} && ulimit -m ${memoryLimitKB}`,
        shell: true,
        note: 'Memory limits enforced via ulimit'
      };
    
    case 'win32':
      // Windows doesn't support ulimit
      // Memory tracking is best-effort
      return {
        supported: false,
        prefix: null,
        command: null,
        shell: false,
        note: 'Memory limits not enforced on Windows (monitoring only)'
      };
    
    default:
      warn(`Unknown platform: ${platform}. Memory limits disabled.`);
      return {
        supported: false,
        prefix: null,
        command: null,
        shell: false,
        note: 'Memory limits not supported on this platform'
      };
  }
}

/**
 * Build safe execution command with limits
 * @param {string} baseCommand - Base execution command
 * @param {number} memoryLimitMB - Memory limit in MB
 * @returns {string} Command with resource limits
 */
export function buildSafeCommand(baseCommand, memoryLimitMB = 256) {
  const limits = getResourceLimits(memoryLimitMB);
  
  if (!limits.supported) {
    // Return base command without limits
    return baseCommand;
  }
  
  // Combine ulimit with execution command
  return `${limits.command} && ${baseCommand}`;
}

/**
 * Check if process is still running
 * @param {object} childProcess - Child process object
 * @returns {boolean} True if process is running
 */
export function isProcessRunning(childProcess) {
  if (!childProcess || !childProcess.pid) {
    return false;
  }
  
  try {
    // Signal 0 checks if process exists without killing it
    process.kill(childProcess.pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Force kill process and all children
 * @param {object} childProcess - Child process object
 * @returns {boolean} True if killed successfully
 */
export function forceKillProcess(childProcess) {
  if (!childProcess || !childProcess.pid) {
    return false;
  }
  
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: Use taskkill to kill process tree
      childProcess.kill('SIGKILL');
    } else {
      // Unix: Kill process group
      try {
        process.kill(-childProcess.pid, 'SIGKILL');
      } catch (e) {
        // Fallback to single process kill
        childProcess.kill('SIGKILL');
      }
    }
    
    return true;
  } catch (error) {
    warn(`Failed to kill process ${childProcess.pid}: ${error.message}`);
    return false;
  }
}

/**
 * Validate workspace path for safety
 * @param {string} workspacePath - Path to validate
 * @param {string} allowedBasePath - Allowed base directory
 * @returns {boolean} True if path is safe
 */
export function isPathSafe(workspacePath, allowedBasePath) {
  // Normalize paths
  const normalizedWorkspace = require('path').resolve(workspacePath);
  const normalizedBase = require('path').resolve(allowedBasePath);
  
  // Check if workspace is inside allowed base
  return normalizedWorkspace.startsWith(normalizedBase);
}

/**
 * Get dangerous command patterns to block
 * @returns {Array} List of blocked patterns
 */
export function getDangerousPatterns() {
  return [
    /curl\s/i,
    /wget\s/i,
    /nc\s/i,        // netcat
    /telnet\s/i,
    /ssh\s/i,
    /rm\s+-rf/i,
    /chmod\s/i,
    /chown\s/i,
    /sudo\s/i,
    /su\s/i,
    /eval\s/i,
    /exec\s/i,
    /\.\.\/\.\.\//, // Path traversal
    /\/etc\//,      // System directories
    /\/home\//,
    /\/root\//,
    /\/proc\//
  ];
}

/**
 * Check if command contains dangerous patterns
 * @param {string} command - Command to check
 * @returns {object} Validation result
 */
export function validateCommand(command) {
  const dangerous = getDangerousPatterns();
  
  for (const pattern of dangerous) {
    if (pattern.test(command)) {
      return {
        safe: false,
        reason: `Command contains blocked pattern: ${pattern}`,
        pattern: pattern.toString()
      };
    }
  }
  
  return {
    safe: true,
    reason: 'Command passed safety checks'
  };
}

/**
 * Get safe environment variables for execution
 * @returns {object} Safe environment object
 */
export function getSafeEnvironment() {
  return {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    USER: process.env.USER,
    LANG: process.env.LANG || 'en_US.UTF-8',
    // Block potentially dangerous vars
    LD_PRELOAD: undefined,
    LD_LIBRARY_PATH: undefined
  };
}

export default {
  getResourceLimits,
  buildSafeCommand,
  isProcessRunning,
  forceKillProcess,
  isPathSafe,
  validateCommand,
  getSafeEnvironment,
  getDangerousPatterns
};
