/**
 * Language Configuration System
 * 
 * DESIGN PRINCIPLE:
 * - Each language is a declarative configuration object
 * - Executor logic never hardcodes language-specific behavior
 * - Adding new language = adding config entry
 * 
 * REQUIRED FIELDS:
 * - id: Unique identifier
 * - name: Display name
 * - extension: Source file extension
 * - needsCompilation: Boolean flag
 * - compile: Compilation command template (if needed)
 * - run: Execution command template
 * - executable: Output binary/entrypoint name
 */

export const LANGUAGES = {
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    needsCompilation: true,
    compile: 'g++ {file} -O2 -std=gnu++17 -o {executable}',
    run: './{executable}',
    executable: 'main',
    errorPatterns: [
      /error:/i,
      /undefined reference/i,
      /segmentation fault/i
    ]
  },

  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    needsCompilation: true,
    compile: 'javac {file}',
    run: 'java Main',
    executable: 'Main.class',
    // Java requires class name to match filename
    enforceClassName: 'Main',
    errorPatterns: [
      /error:/i,
      /exception/i,
      /cannot find symbol/i
    ]
  },

  python: {
    id: 'python',
    name: 'Python 3',
    extension: '.py',
    needsCompilation: false,
    run: 'python3 {file}',
    executable: null,
    errorPatterns: [
      /SyntaxError/i,
      /IndentationError/i,
      /NameError/i,
      /TypeError/i
    ]
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    extension: '.js',
    needsCompilation: false,
    run: 'node {file}',
    executable: null,
    errorPatterns: [
      /SyntaxError/i,
      /ReferenceError/i,
      /TypeError/i
    ]
  }
};

/**
 * Get language configuration by ID
 * @param {string} langId - Language identifier
 * @returns {object|null} Language config or null if not found
 */
export function getLanguage(langId) {
  return LANGUAGES[langId] || null;
}

/**
 * Get all supported language IDs
 * @returns {string[]} Array of language identifiers
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGES);
}

/**
 * Validate if language is supported
 * @param {string} langId - Language identifier
 * @returns {boolean} True if supported
 */
export function isLanguageSupported(langId) {
  return langId in LANGUAGES;
}
