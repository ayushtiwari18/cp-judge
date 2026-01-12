/**
 * File System Utilities
 * 
 * RESPONSIBILITIES:
 * - Create isolated workspaces per request
 * - Write source code safely
 * - Clean up after execution
 * - Remove stale workspaces on startup
 * - Cross-platform path handling
 * - Security: Owner-only permissions
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base workspace directory
const WORKSPACE_ROOT = path.join(__dirname, '..', 'workspace');

// Workspace naming pattern
const WORKSPACE_PATTERN = /^ws_\d+_[a-f0-9]+$/;

/**
 * Create a unique isolated workspace directory
 * Security: 0o700 permissions (owner read/write/execute only)
 * @returns {Promise<string>} Absolute path to workspace
 */
export async function createWorkspace() {
  // Ensure workspace root exists
  await fs.mkdir(WORKSPACE_ROOT, { recursive: true });

  // Generate unique directory name
  const uniqueId = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const workspacePath = path.join(WORKSPACE_ROOT, `ws_${timestamp}_${uniqueId}`);

  // Create isolated directory with secure permissions
  // 0o700 = owner only (rwx------)
  await fs.mkdir(workspacePath, { 
    recursive: true,
    mode: 0o700  // Security: Prevents other users from accessing
  });

  return workspacePath;
}

/**
 * Write source code to file in workspace
 * @param {string} workspacePath - Workspace directory path
 * @param {string} filename - Name of source file
 * @param {string} code - Source code content
 * @returns {Promise<string>} Absolute path to created file
 */
export async function writeSourceFile(workspacePath, filename, code) {
  const filePath = path.join(workspacePath, filename);
  await fs.writeFile(filePath, code, 'utf8');
  return filePath;
}

/**
 * Clean up workspace directory with retry logic
 * Delays cleanup to ensure processes are fully terminated
 * @param {string} workspacePath - Workspace directory path
 * @param {number} delayMs - Delay before cleanup (ensures process death)
 * @returns {Promise<void>}
 */
export async function cleanupWorkspace(workspacePath, delayMs = 100) {
  try {
    // Small delay to ensure all processes are dead
    // Prevents "directory in use" errors on Windows
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    await fs.rm(workspacePath, { recursive: true, force: true });
  } catch (error) {
    // Log but don't throw - cleanup failure shouldn't crash server
    console.error(`[CLEANUP ERROR] Failed to remove ${workspacePath}:`, error.message);
    
    // Retry once after longer delay
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await fs.rm(workspacePath, { recursive: true, force: true });
      console.log(`[CLEANUP] Retry successful for ${workspacePath}`);
    } catch (retryError) {
      console.error(`[CLEANUP ERROR] Retry failed for ${workspacePath}:`, retryError.message);
    }
  }
}

/**
 * Clean up stale workspaces on server startup
 * Removes directories older than 1 hour to handle:
 * - Server crashes
 * - Incomplete cleanup
 * - Development interruptions
 * 
 * Call this during server initialization.
 * @returns {Promise<number>} Number of directories cleaned
 */
export async function cleanupStaleWorkspaces() {
  try {
    // Ensure workspace root exists
    await fs.mkdir(WORKSPACE_ROOT, { recursive: true });

    // Read all entries in workspace root
    const entries = await fs.readdir(WORKSPACE_ROOT, { withFileTypes: true });
    
    let cleanedCount = 0;
    const staleAgeMs = 60 * 60 * 1000; // 1 hour
    const now = Date.now();

    for (const entry of entries) {
      // Only process directories matching workspace pattern
      if (!entry.isDirectory() || !WORKSPACE_PATTERN.test(entry.name)) {
        continue;
      }

      const workspacePath = path.join(WORKSPACE_ROOT, entry.name);

      try {
        // Extract timestamp from directory name
        const timestampMatch = entry.name.match(/^ws_(\d+)_/);
        if (!timestampMatch) continue;

        const timestamp = parseInt(timestampMatch[1], 10);
        const age = now - timestamp;

        // Remove if older than threshold
        if (age > staleAgeMs) {
          await fs.rm(workspacePath, { recursive: true, force: true });
          cleanedCount++;
          console.log(`[STARTUP CLEANUP] Removed stale workspace: ${entry.name} (age: ${Math.round(age / 1000 / 60)}min)`);
        }
      } catch (error) {
        console.error(`[STARTUP CLEANUP ERROR] Failed to remove ${entry.name}:`, error.message);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[STARTUP CLEANUP] Removed ${cleanedCount} stale workspace(s)`);
    } else {
      console.log('[STARTUP CLEANUP] No stale workspaces found');
    }

    return cleanedCount;

  } catch (error) {
    console.error('[STARTUP CLEANUP ERROR] Failed to clean stale workspaces:', error.message);
    return 0;
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if exists
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get cross-platform executable path
 * @param {string} workspacePath - Workspace directory
 * @param {string} executableName - Name of executable
 * @returns {string} Platform-specific executable path
 */
export function getExecutablePath(workspacePath, executableName) {
  // Windows requires .exe extension for compiled binaries
  if (process.platform === 'win32' && !executableName.includes('.')) {
    return path.join(workspacePath, `${executableName}.exe`);
  }
  return path.join(workspacePath, executableName);
}

/**
 * Get workspace statistics (for monitoring/debugging)
 * @returns {Promise<object>} Workspace statistics
 */
export async function getWorkspaceStats() {
  try {
    await fs.mkdir(WORKSPACE_ROOT, { recursive: true });
    const entries = await fs.readdir(WORKSPACE_ROOT, { withFileTypes: true });
    
    const workspaces = entries.filter(e => 
      e.isDirectory() && WORKSPACE_PATTERN.test(e.name)
    );

    return {
      total: workspaces.length,
      root: WORKSPACE_ROOT,
      workspaces: workspaces.map(w => w.name)
    };
  } catch (error) {
    return {
      total: 0,
      root: WORKSPACE_ROOT,
      error: error.message
    };
  }
}
