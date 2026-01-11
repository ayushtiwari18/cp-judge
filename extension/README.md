# CP Judge Browser Extension

**Local Competitive Programming Judge - Browser Integration**

Chrome and Firefox extension that automatically extracts test cases from competitive programming websites and executes them on your local judge.

---

## Features

✅ **Automatic Test Case Extraction** - One-click parsing from problem pages  
✅ **Multi-Platform Support** - Codeforces, LeetCode, AtCoder, CodeChef  
✅ **Instant Local Execution** - No network latency  
✅ **Real-Time Verdicts** - AC, WA, TLE, RE, CE with color coding  
✅ **Manual Test Management** - Add, edit, delete test cases  
✅ **Keyboard Shortcuts** - Fast workflow  
✅ **Modern UI** - Clean, responsive design  

---

## Prerequisites

### 1. Local Judge Server Running

```bash
cd server
npm install
npm start
```

Server must be running on `http://localhost:3000`

### 2. Browser

- **Chrome** 88+ or **Edge** 88+
- **Firefox** 109+ (Manifest V3 support)

---

## Installation

### Chrome / Edge

1. **Clone Repository**
   ```bash
   git clone https://github.com/ayushtiwari18/cp-judge.git
   cd cp-judge/extension
   ```

2. **Open Extensions Page**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle switch in top right

4. **Load Extension**
   - Click "Load unpacked"
   - Select `cp-judge/extension` folder

5. **Pin Extension** (Recommended)
   - Click puzzle icon in toolbar
   - Pin "CP Judge" for easy access

### Firefox

1. **Clone Repository** (same as above)

2. **Open Debugging Page**
   - Navigate to `about:debugging#/runtime/this-firefox`

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Select `extension/manifest.json`

**Note**: Firefox requires reloading on every browser restart (temporary limitation)

---

## Usage

### Basic Workflow

1. **Start Local Judge**
   ```bash
   cd server && npm start
   ```

2. **Visit Problem Page**
   - Go to any supported platform (e.g., Codeforces)
   - Open a problem

3. **Open Extension Popup**
   - Click extension icon
   - OR press `Ctrl+Shift+P` (parse shortcut)

4. **Parse Problem**
   - Click refresh button
   - Test cases appear automatically

5. **Write Code**
   - Paste your solution in code editor
   - Select language (C++, Java, Python, JavaScript)

6. **Run Tests**
   - Click "Run Tests" button
   - OR press `Ctrl+Shift+R`

7. **View Results**
   - See verdicts with execution time
   - Compare expected vs actual output

---

## Supported Platforms

| Platform | Status | Test Cases | Notes |
|----------|--------|------------|-------|
| **Codeforces** | ✅ Full Support | Auto-extracted | All contest types |
| **LeetCode** | 🟡 Partial | Manual entry | Hidden test cases |
| **AtCoder** | ✅ Full Support | Auto-extracted | Contest problems |
| **CodeChef** | ✅ Full Support | Auto-extracted | Practice & contests |

### Adding More Platforms

See [Development](#development) section below.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Parse current problem |
| `Ctrl+Shift+R` | Run test cases |
| `Ctrl+Enter` | Run tests (when popup open) |

**Mac Users**: Replace `Ctrl` with `Cmd`

---

## UI Components

### Header
- **Judge Status**: 🟢 Running / 🔴 Offline
- Shows connection to local judge

### Problem Section
- **Name**: Auto-extracted from page
- **Time Limit**: Execution timeout
- **Memory Limit**: (Informational)
- **Platform**: Source website

### Language Selector
- C++ (g++ with -O2 -std=gnu++17)
- Java (javac + java)
- Python 3
- JavaScript (Node.js)

### Code Editor
- Monospace font
- Syntax highlighting (basic)
- Paste your solution here

### Test Cases
- **View**: Input and expected output
- **Add**: Manual test case creation
- **Edit**: Modify existing tests
- **Delete**: Remove unwanted tests

### Results
- **Verdict Colors**:
  - 🟢 **AC** (Accepted) - Green
  - 🔴 **WA** (Wrong Answer) - Red
  - 🟠 **TLE** (Time Limit Exceeded) - Orange
  - 🟣 **RE** (Runtime Error) - Purple
  - 🔵 **CE** (Compilation Error) - Indigo

---

## Troubleshooting

### Judge Status Shows "Offline"

**Problem**: Extension can't connect to local judge

**Solutions**:
1. Start the judge server:
   ```bash
   cd server && npm start
   ```
2. Verify server is running:
   ```bash
   curl http://localhost:3000/api/health
   ```
3. Check port 3000 is not blocked

### Test Cases Not Extracted

**Problem**: Popup shows "No test cases available"

**Solutions**:
1. Click refresh button (🔄) in popup
2. Manually trigger parse: `Ctrl+Shift+P`
3. Check browser console for errors (F12)
4. Platform may have changed structure (needs scraper update)
5. Add test cases manually using ➕ button

### "Execution failed" Error

**Problem**: Code won't run

**Solutions**:
1. Check compiler/runtime installed:
   ```bash
   g++ --version    # For C++
   java --version   # For Java
   python3 --version # For Python
   node --version   # For JavaScript
   ```
2. Check server logs for errors
3. Verify code syntax is correct
4. Try simple "Hello World" first

### Extension Not Working on Firefox

**Problem**: Temporary add-on disappeared

**Solution**: Firefox clears temporary add-ons on restart. Reload extension from `about:debugging`.

**Permanent Solution**: Package as `.xpi` file (see Firefox docs)

### CORS Errors in Console

**Problem**: `Access-Control-Allow-Origin` errors

**Solution**: CORS is configured in server. Ensure server is running and extension manifest includes correct host permissions.

---

## Development

### Project Structure

```
extension/
├── manifest.json           # Extension configuration
├── background/
│   └── background.js      # Service worker (API client)
├── content/
│   └── scrapers/          # Platform-specific scrapers
│       ├── codeforces.js
│       ├── leetcode.js
│       ├── atcoder.js
│       └── codechef.js
├── popup/
│   ├── popup.html         # Main UI
│   ├── popup.css          # Styles
│   └── popup.js           # UI logic
├── icons/                 # Extension icons
└── README.md
```

### Adding a New Platform

1. **Create Scraper File**
   ```javascript
   // extension/content/scrapers/yourplatform.js
   (function() {
     function parseProblem() {
       return {
         platform: 'yourplatform',
         name: 'Problem Name',
         url: window.location.href,
         timeLimit: 2000,
         memoryLimit: 256,
         testCases: [
           { input: '...', expectedOutput: '...' }
         ],
         timestamp: Date.now()
       };
     }

     chrome.runtime.onMessage.addListener((message) => {
       if (message.type === 'PARSE_PROBLEM') {
         const data = parseProblem();
         chrome.runtime.sendMessage({
           type: 'STORE_PROBLEM',
           data: data
         });
       }
     });
   })();
   ```

2. **Update Manifest**
   ```json
   {
     "content_scripts": [
       {
         "matches": ["*://yourplatform.com/problem/*"],
         "js": ["content/scrapers/yourplatform.js"]
       }
     ]
   }
   ```

3. **Test**
   - Reload extension
   - Visit problem page
   - Check browser console for errors

### Debugging

**Background Worker**:
```javascript
chrome://extensions/ → CP Judge → Inspect views: service worker
```

**Content Scripts**:
```javascript
F12 on problem page → Console tab
```

**Popup**:
```javascript
Right-click extension icon → Inspect popup
```

---

## Permissions Explained

| Permission | Reason |
|------------|--------|
| `activeTab` | Access current tab for parsing |
| `storage` | Store problem data locally |
| `scripting` | Inject content scripts |
| `host_permissions` | Access CP platforms and localhost |

**Privacy**: All data stays local. No external servers contacted except problem platforms.

---

## Roadmap

- [ ] Chrome Web Store publication
- [ ] Firefox Add-ons publication
- [ ] Auto-detect language from page
- [ ] Copy code from page editor
- [ ] Dark mode
- [ ] Custom checker support
- [ ] Stress testing integration
- [ ] Statistics dashboard

---

## Contributing

Contributions welcome!

**Priority Areas**:
1. Platform scrapers (HackerRank, SPOJ, etc.)
2. UI improvements
3. Bug fixes
4. Documentation

---

## License

MIT License - see [LICENSE](../LICENSE)

---

## Support

**Issues**: [GitHub Issues](https://github.com/ayushtiwari18/cp-judge/issues)  
**Discussions**: [GitHub Discussions](https://github.com/ayushtiwari18/cp-judge/discussions)

---

## Acknowledgments

Inspired by [Competitive Programming Helper (CPH)](https://github.com/agrawal-d/cph)
