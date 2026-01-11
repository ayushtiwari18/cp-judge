# CP Judge - Local Competitive Programming Judge

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey.svg)

**A production-grade local judge for competitive programming**

Fast • Accurate • Offline-First

</div>

---

## 🎯 Problem Statement

Competitive programmers waste time:
- ❌ Copying test cases manually
- ❌ Switching between browser and editor
- ❌ Debugging formatting issues blindly

**CP Judge solves this** with:
- ✅ Automatic test case extraction
- ✅ One-click execution from browser
- ✅ Instant feedback with detailed diff

---

## ✨ Features

### Core Functionality
- **Multi-language Support:** C++, Java, Python, JavaScript
- **Automatic Test Extraction:** Scrape problems from Codeforces
- **Professional Verdicts:** AC, WA, TLE, RE, CE
- **Diff Viewer:** Line-by-line output comparison
- **Multiple Test Cases:** Run all samples at once
- **Performance Metrics:** Time and memory tracking

### Technical Excellence
- **Offline-First:** Works without internet after test cases load
- **Safe Execution:** Workspace isolation and resource limits
- **Clean Logging:** DEBUG mode for development
- **Professional Architecture:** Modular, testable, maintainable

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Compilers/Interpreters:**
  - C++: `g++` (Linux/Mac) or MinGW (Windows)
  - Java: JDK 11+
  - Python: 3.8+
  - JavaScript: Node.js

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/ayushtiwari18/cp-judge.git
cd cp-judge
```

#### 2. Install Server Dependencies
```bash
cd server
npm install
```

#### 3. Load Browser Extension

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension` folder from this repo

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from `extension` folder

#### 4. Start Server
```bash
cd server
npm start
```

**Server runs on:** `http://localhost:3000`

---

## 📚 Usage Guide

### Basic Workflow

1. **Open a Codeforces problem** (e.g., https://codeforces.com/problemset/problem/1877/A)
2. **Extension auto-extracts** test cases
3. **Write your solution** in your favorite editor
4. **Click extension icon** → Paste code → Run
5. **Get instant verdict** with diff (if WA)

### Example

**Problem:** Sum of two numbers

**Input:**
```
2
3 5
10 20
```

**Expected Output:**
```
8
30
```

**Your Code:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int t;
    cin >> t;
    while(t--) {
        int a, b;
        cin >> a >> b;
        cout << a + b << endl;
    }
    return 0;
}
```

**Result:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Verdict: AC
Tests Passed: 2/2
Total Time: 8ms
Peak Memory: 7.84MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏛️ Architecture

### High-Level Overview

```
┌─────────────────┐
│  Browser        │
│  Extension      │  ← User Interface
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Local Server   │
│  (Node.js)      │  ← Execution Engine
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  OS Toolchain   │
│  (g++/javac/    │  ← Compilers/Interpreters
│   python/node)  │
└─────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Extension** | Scrape problems, display results |
| **Server** | Execute code, determine verdict |
| **Executor** | Compilation, sandboxing, timeout |
| **Verdict Engine** | AC/WA/TLE/RE classification |
| **Diff Generator** | Output comparison |

### Key Design Decisions

✅ **1 Execution = 1 Test Case**
- Each test runs in isolation
- Clean stdin/stdout per test
- No shared state between tests

✅ **Workspace Isolation**
- Each run gets a temporary directory
- Cleaned up after execution
- No cross-contamination

✅ **Strict Output Normalization**
- Preserves case sensitivity
- Removes trailing whitespace
- Handles platform line endings

---

## 🔒 Security Model

### Current Protections

- ✅ Workspace isolation (temporary directories)
- ✅ Timeout enforcement (kills runaway processes)
- ✅ Memory tracking (monitoring)
- ✅ Process cleanup (forced kill on timeout)

### Known Limitations

⚠️ **Local execution is inherently less secure than sandboxed environments**

- Network access not blocked (future: Docker/firejail)
- Filesystem access limited by OS permissions only
- Memory limits are best-effort (OS-dependent)

**Recommendation:** Only run trusted code or use in isolated environments.

---

## 🧠 Technical Details

### Verdict Determination Logic

```javascript
if (timedOut) return "TLE";
if (exitCode !== 0) return "RE";
if (output !== expected) return "WA";
return "AC";
```

### Memory Tracking

- Samples every 50ms during execution
- Tracks peak and average usage
- Best-effort (OS-dependent accuracy)

### Time Measurement

- High-precision (`performance.now()`)
- Measured from process spawn to exit
- Millisecond accuracy

---

## 📊 Performance

| Metric | Typical Value |
|--------|---------------|
| Startup Time | < 1s |
| Test Execution | 5-50ms (simple) |
| Memory Usage | 10-50MB per test |
| Compilation | 500-2000ms |

---

## 🛠️ Development

### Debug Mode

```bash
DEBUG=true npm start
```

Shows detailed logs:
- Input/output comparison
- Diff analysis
- Execution metrics

### Project Structure

```
cp-judge/
├── server/
│   ├── api/              # HTTP endpoints
│   ├── executor/         # Core judge logic
│   ├── languages/        # Language configs
│   ├── utils/            # Helpers
│   └── server.js         # Entry point
├── extension/
│   ├── background.js     # Service worker
│   ├── content.js        # Page injection
│   ├── popup/            # UI
│   └── manifest.json     # Extension config
└── README.md
```

### Adding a New Language

1. Edit `server/languages/config.js`
2. Add language configuration:
```javascript
newlang: {
  name: 'New Language',
  extension: '.ext',
  needsCompilation: false,
  compile: null,
  run: 'interpreter {file}'
}
```

---

## ✅ Testing

See [TESTING.md](TESTING.md) for:
- Edge case scenarios
- Security tests
- Performance benchmarks
- Manual testing checklist

---

## 🚧 Known Issues

| Issue | Impact | Workaround |
|-------|--------|------------|
| Memory limits not enforced on Windows | Low | Use Linux/Mac for strict limits |
| Java warm-up effect | Low | First run may be slower |
| CF DOM changes break scraper | Medium | Update selectors in `codeforces.js` |

---

## 💯 Roadmap

### v1.1 (Near-term)
- [ ] Docker sandboxing
- [ ] Stress testing mode
- [ ] More platforms (AtCoder, LeetCode)

### v2.0 (Long-term)
- [ ] Custom checkers
- [ ] Interactive problems
- [ ] Code analysis/hints
- [ ] Team collaboration

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file

---

## 👤 Author

**Ayush Tiwari**
- GitHub: [@ayushtiwari18](https://github.com/ayushtiwari18)
- Project: [cp-judge](https://github.com/ayushtiwari18/cp-judge)

---

## 🚀 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 🔗 Resources

- [Codeforces](https://codeforces.com/)
- [CPH Judge (Inspiration)](https://github.com/agrawal-d/cph)
- [Competitive Programming](https://cp-algorithms.com/)

---

<div align="center">

**Star ⭐ this repo if you found it useful!**

</div>
