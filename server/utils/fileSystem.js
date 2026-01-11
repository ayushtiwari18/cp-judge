/**
 * File System Utilities
 * 
 * RESPONSIBILITIES:
 * - Create isolated workspaces per request
 * - Write source code safely
 * - Clean up after execution
 * - Cross-platform path handling
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base workspace directory
const WORKSPACE_ROOT = path.join(__dirname, '..', 'workspace');

/**
 * Create a unique isolated workspace directory
 * @returns {Promise<string>} Absolute path to workspace
 */
export async function createWorkspace() {
  // Ensure workspace root exists
  await fs.mkdir(WORKSPACE_ROOT, { recursive: true });

  // Generate unique directory name
  const uniqueId = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const workspacePath = path.join(WORKSPACE_ROOT, `ws_${timestamp}_${uniqueId}`);

  // Create isolated directory
  await fs.mkdir(workspacePath, { recursive: true });

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
 * Clean up workspace directory
 * @param {string} workspacePath - Workspace directory path
 * @returns {Promise<void>}
 */
export async function cleanupWorkspace(workspacePath) {
  try {
    await fs.rm(workspacePath, { recursive: true, force: true });
  } catch (error) {
    // Log but don't throw - cleanup failure shouldn't crash server
    console.error(`[CLEANUP ERROR] Failed to remove ${workspacePath}:`, error.message);
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
