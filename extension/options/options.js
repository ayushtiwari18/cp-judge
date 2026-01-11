/**
 * Options Page Logic
 * Handles settings management for CP Judge extension
 */

const form = document.getElementById('settingsForm');
const judgeUrlInput = document.getElementById('judgeUrl');
const defaultLanguageSelect = document.getElementById('defaultLanguage');
const defaultTimeLimitInput = document.getElementById('defaultTimeLimit');
const autoParseCheckbox = document.getElementById('autoParseOnPageLoad');
const statusDiv = document.getElementById('status');

/**
 * Load saved settings
 */
async function loadSettings() {
  try {
    const data = await chrome.storage.local.get(['settings']);
    
    if (data.settings) {
      const settings = data.settings;
      
      judgeUrlInput.value = settings.judgeUrl || 'http://localhost:3000';
      defaultLanguageSelect.value = settings.defaultLanguage || 'cpp';
      defaultTimeLimitInput.value = settings.defaultTimeLimit || 2000;
      autoParseCheckbox.checked = settings.autoParseOnPageLoad || false;
    }
    
    console.log('[OPTIONS] Settings loaded');
  } catch (error) {
    console.error('[OPTIONS] Failed to load settings:', error);
  }
}

/**
 * Save settings
 */
async function saveSettings(event) {
  event.preventDefault();
  
  // Validate judge URL
  const judgeUrl = judgeUrlInput.value.trim();
  if (!judgeUrl.startsWith('http://') && !judgeUrl.startsWith('https://')) {
    showStatus('Please enter a valid URL starting with http:// or https://', 'error');
    return;
  }
  
  // Validate time limit
  const timeLimit = parseInt(defaultTimeLimitInput.value);
  if (isNaN(timeLimit) || timeLimit < 100 || timeLimit > 10000) {
    showStatus('Time limit must be between 100 and 10000 milliseconds', 'error');
    return;
  }
  
  // Prepare settings object
  const settings = {
    judgeUrl: judgeUrl,
    defaultLanguage: defaultLanguageSelect.value,
    defaultTimeLimit: timeLimit,
    autoParseOnPageLoad: autoParseCheckbox.checked
  };
  
  try {
    // Save to storage
    await chrome.storage.local.set({ settings });
    
    console.log('[OPTIONS] Settings saved:', settings);
    showStatus('✅ Settings saved successfully!', 'success');
    
    // Hide status after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('[OPTIONS] Failed to save settings:', error);
    showStatus('❌ Failed to save settings: ' + error.message, 'error');
  }
}

/**
 * Show status message
 */
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}

// Event listeners
form.addEventListener('submit', saveSettings);

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
