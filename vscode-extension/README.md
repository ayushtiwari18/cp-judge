# CP Judge - VS Code Extension

> Run competitive programming code directly from VS Code using the CP Judge local server.

## Features

- ✅ **Run code without leaving VS Code** - No browser or terminal switching
- ✅ **Multi-language support** - C++, Java, Python, JavaScript
- ✅ **Instant feedback** - See verdicts, execution time, and memory usage
- ✅ **Diff view** - Compare expected vs actual output for WA cases
- ✅ **Offline-first** - No internet required after setup

---

## Prerequisites

### 1. CP Judge Server Running

This extension requires the CP Judge local server to be running.

```bash
# In the project root
cd server
npm install
npm start

# Server should be running on http://localhost:3000
```

### 2. Compilers/Interpreters Installed

Ensure you have the required compilers for your language:

- **C++**: `g++` (GCC)
- **Java**: `javac` + `java` (JDK)
- **Python**: `python3`
- **JavaScript**: `node`

**Verify installation:**
```bash
g++ --version
javac --version
python3 --version
node --version
```

---

## Installation

### Development Mode (Current)

1. **Open extension folder in VS Code:**
   ```bash
   cd vscode-extension
   code .
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch extension:**
   - Press `F5` to open a new VS Code window with the extension loaded
   - OR: Debug → Start Debugging

### Marketplace Installation (Coming Soon)

```bash
# Future
ext install ayush5410.cp-judge-vscode
```

---

## Usage

### 1. Create Test Files

In your **workspace root**, create two files:

```
workspace/
├── solution.cpp        # Your code
├── input.txt           # Test input
└── output.txt          # Expected output
```

**Example:**

**input.txt:**
```
5 3
```

**output.txt:**
```
8
```

### 2. Write Your Code

**solution.cpp:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

### 3. Run the Judge

**Method 1: Command Palette**
1. Open `solution.cpp`
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type: **CP Judge: Run**
4. Press Enter

**Method 2: Keyboard Shortcut**
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### 4. View Results

Results appear in the **Output** panel (View → Output → CP Judge):

```
🚀 CP Judge - Starting execution...

[1/5] Checking server health...
✅ Server is running

[2/5] Reading active file...
✅ File: solution.cpp
✅ Language: cpp

[3/5] Reading test files...
✅ Found 1 test case(s)

[4/5] Submitting to judge...
✅ Execution complete

[5/5] Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Verdict: ✅ AC
Tests Passed: 1/1
Total Time: 45ms
Peak Memory: 2.1MB

Test Case 1:
  Verdict: ✅ AC
  Time: 45ms
  Memory: 2.1MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed!
```

---

## Verdict Types

| Verdict | Emoji | Meaning |
|---------|-------|--------|
| **AC** | ✅ | Accepted - Correct output |
| **WA** | ❌ | Wrong Answer - Output doesn't match |
| **TLE** | ⏱️ | Time Limit Exceeded - Too slow |
| **RE** | 💥 | Runtime Error - Crashed during execution |
| **CE** | 🔨 | Compilation Error - Code doesn't compile |
| **MLE** | 💾 | Memory Limit Exceeded - Used too much memory |

---

## Supported Languages

| Language | File Extension | VS Code Language ID |
|----------|----------------|--------------------|
| C++ | `.cpp` | `cpp` |
| Java | `.java` | `java` |
| Python | `.py` | `python` |
| JavaScript | `.js` | `javascript` |

**Auto-detection:** The extension automatically detects the language based on your file extension.

---

## Troubleshooting

### ❌ Error: "Judge server not running"

**Cause:** CP Judge server is not running on `localhost:3000`.

**Solution:**
```bash
cd server
npm start
```

Verify server is running:
```bash
curl http://localhost:3000/api/health
```

---

### ❌ Error: "input.txt not found in workspace root"

**Cause:** Missing test files in workspace root.

**Solution:**
1. Create `input.txt` in your workspace root (same directory as `.vscode/`)
2. Add test input data
3. Create `output.txt` with expected output

**File structure:**
```
my-workspace/
├── .vscode/
├── input.txt      ← Create this
├── output.txt     ← Create this
└── solution.cpp
```

---

### ❌ Error: "Unsupported language"

**Cause:** File type not supported by judge.

**Solution:**
- Ensure file has correct extension (`.cpp`, `.java`, `.py`, `.js`)
- VS Code must recognize the language (check bottom-right corner)
- If VS Code shows wrong language, click it and select correct one

---

### ❌ Compilation Error (CE)

**Common causes:**
- **C++:** Missing `#include`, syntax errors
- **Java:** Class name doesn't match filename (must be `Main`)
- **Python:** Indentation errors, syntax errors

**Check output panel** for detailed compiler error messages.

---

### ❌ Wrong Answer (WA)

**Check the diff output** in the Output panel:

```
Test Case 1:
  Verdict: ❌ WA
  
  Difference:
    Expected: 8
    Actual:   9
```

**Common causes:**
- Off-by-one errors
- Missing newline at end of output
- Extra whitespace
- Wrong logic

---

## Architecture

### Thin Client Design

This extension is a **thin client** - it does NOT execute code locally.

```
VS Code Extension          CP Judge Server
     (UI Only)          (Compilation + Execution)
        │                        │
        │  POST /api/run          │
        ├────────────────────────▶
        │                        │
        │                   Compile & Run
        │                        │
        ◀────────────────────────┤
        │     Results            │
        │                        │
   Display Output
```

**Responsibilities:**

**Extension:**
- Read active file & detect language
- Read test files (`input.txt` / `output.txt`)
- Send API request to server
- Display results in Output Channel

**Server:**
- Compile code (if needed)
- Execute with test cases
- Enforce time/memory limits
- Return verdicts & metrics

**Benefits:**
- ✅ No code execution in VS Code process
- ✅ Consistent verdicts (same engine as browser extension)
- ✅ Isolation & security (server handles sandboxing)
- ✅ Easier to maintain (one execution engine)

---

## Development

### Project Structure

```
vscode-extension/
├── extension.js      # Core extension logic
├── package.json      # Extension manifest
├── README.md         # This file
└── .vscode/
    └── launch.json   # Debug configuration
```

### Debug Extension

1. Open `vscode-extension/` in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new window, open a workspace with test files
4. Test the `CP Judge: Run` command
5. Check Debug Console for logs

### Key Functions

| Function | Purpose |
|----------|--------|
| `activate()` | Extension entry point |
| `runJudge()` | Main command handler |
| `checkServer()` | Health check |
| `getActiveFile()` | Read current file |
| `readTestFiles()` | Load input/output |
| `displayResults()` | Format output |

---

## Roadmap

### v0.1.0 (MVP) - ✅ Current
- [x] Basic command: CP Judge: Run
- [x] Support C++, Java, Python, JavaScript
- [x] Read test files from workspace root
- [x] Display results in Output Channel
- [x] Server health check

### v0.2.0 (Planned)
- [ ] Multiple test cases support
- [ ] Test case management UI
- [ ] Custom server URL configuration
- [ ] Keyboard shortcut customization

### v1.0.0 (Future)
- [ ] Inline test cases (in code comments)
- [ ] Problem scraping integration
- [ ] Stress testing mode
- [ ] Performance profiling

---

## Contributing

Contributions welcome! See main repository: [github.com/ayushtiwari18/cp-judge](https://github.com/ayushtiwari18/cp-judge)

---

## License

MIT License - See LICENSE file in repository root.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/ayushtiwari18/cp-judge/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ayushtiwari18/cp-judge/discussions)

---

**Made with ❤️ for competitive programmers**
