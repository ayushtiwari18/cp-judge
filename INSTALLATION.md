# 🚀 CP Judge – Installation & Setup Guide

A local competitive programming judge with Codeforces integration, multi-language support, and professional performance metrics.

---

## ✅ STATUS: PRODUCTION-READY

All core features implemented and tested:
- ✅ Multi-language execution (C++, Java, Python, JavaScript)
- ✅ Automatic test case extraction
- ✅ Professional verdict system with diff viewer
- ✅ Time & memory tracking
- ✅ Multiple test case support

---

## 📥 INSTALLATION STEPS

### **Step 1: Clone Repository**

```bash
git clone https://github.com/ayushtiwari18/cp-judge.git
cd cp-judge
```

### **Step 2: Install Server Dependencies**

```bash
cd server
npm install
```

### **Step 3: Load Browser Extension**

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode** (top-right toggle)

3. **Click "Load unpacked"**

4. **Select Extension Directory**
   - Navigate to: `cp-judge/extension`
   - Click "Select Folder"

5. **Confirm Installation**
   - Extension should appear as: **"CP Judge - Local Execution Engine"**
   - Default icon (puzzle piece) is expected

### **Step 4: Pin Extension (Recommended)**

1. Click the 🧩 **puzzle icon** in Chrome toolbar
2. Find **"CP Judge - Local Execution Engine"**
3. Click 📌 **Pin**

### **Step 5: Start Local Judge Server**

```bash
cd server
npm start
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CP JUDGE LOCAL SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Status: RUNNING
  Port: 3000
  URL: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

⚠️ **Keep this terminal running** while using the extension.

---

## 🧪 VERIFY INSTALLATION

### **Step 6: Test on Codeforces**

1. **Open Test Problem**
   ```
   https://codeforces.com/problemset/problem/1/A
   ```

2. **Click CP Judge Extension Icon**
   - Check status indicator:
     - 🟢 **Judge Running** → OK
     - 🔴 **Judge Offline** → Restart server

3. **Parse Problem**
   - Click 🔄 **Refresh** button
   - OR press `Ctrl + Shift + P`

4. **Confirm Problem Data**
   - Problem title: "A. Theatre Square"
   - Sample test cases visible
   - Input/Output displayed

### **Step 7: Run Test Submission**

**Paste this C++ solution:**

```cpp
#include <iostream>
using namespace std;

int main() {
    long long n, m, a;
    cin >> n >> m >> a;
    long long x = (n + a - 1) / a;
    long long y = (m + a - 1) / a;
    cout << x * y << endl;
    return 0;
}
```

**Run Test:**
- Click ▶️ **Run Tests**
- OR press `Ctrl + Enter`

**Expected Result:**
```
✅ Test Case 1: AC (Accepted)
Execution Time: 3-5ms
Memory Usage: 7-10MB
```

---

## 🛠 TROUBLESHOOTING

### **Extension Fails to Load**

**Check for errors:**
```
chrome://extensions/ → CP Judge Details → Errors
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Service worker registration failed | Restart Chrome completely |
| Manifest missing or unreadable | Verify you selected `extension/` folder |
| Popup doesn't open | Right-click extension → "Inspect popup" |

### **Server Connection Issues**

**If extension shows "Judge Offline":**

1. **Verify server is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Expected: `{"status":"ok"}`

2. **Check port 3000 is free:**
   ```bash
   lsof -i :3000
   ```

3. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

### **Test Cases Not Parsing**

1. **Hard refresh page:** `Ctrl + Shift + R`
2. **Check browser console:** `F12` → Console tab
3. **Verify URL matches:**
   - ✅ `codeforces.com/problemset/problem/*`
   - ✅ `codeforces.com/contest/*/problem/*`
   - ❌ `codeforces.com/` (homepage)

### **Compilation Errors**

**Verify compilers installed:**

```bash
# C++
g++ --version

# Java
javac --version

# Python
python3 --version

# Node.js
node --version
```

---

## ✅ VERIFICATION CHECKLIST

Before reporting issues, confirm:

- [ ] Extension visible in `chrome://extensions/`
- [ ] No red error banners on extension
- [ ] Popup opens when clicking extension icon
- [ ] Server terminal shows "RUNNING"
- [ ] Problem title appears after parsing
- [ ] Test cases displayed in extension
- [ ] Code executes without errors
- [ ] Verdicts displayed correctly (AC/WA/etc)

---

## 🎯 FEATURE OVERVIEW

### **Supported Platforms**
- ✅ Codeforces (full support)
- 🚧 LeetCode (planned)
- 🚧 AtCoder (planned)
- 🚧 CodeChef (planned)

### **Supported Languages**
| Language | Compiler/Interpreter | Status |
|----------|---------------------|--------|
| C++ | g++ (C++17) | ✅ Stable |
| Java | javac + java | ✅ Stable |
| Python | python3 | ✅ Stable |
| JavaScript | Node.js | ✅ Stable |

### **Verdict Types**
| Verdict | Description |
|---------|-------------|
| **AC** | Accepted (correct output) |
| **WA** | Wrong Answer (with diff viewer) |
| **TLE** | Time Limit Exceeded |
| **RE** | Runtime Error |
| **CE** | Compilation Error |

### **Performance Metrics**
- ⏱️ **Execution Time:** Millisecond precision
- 💾 **Memory Usage:** Peak and average tracking
- 📊 **Per-Test Stats:** Individual test performance
- 📈 **Aggregated Summary:** Overall performance

---

## 📦 PROJECT STATUS

| Component | Status |
|-----------|--------|
| Local Judge Server | ✅ Complete |
| Browser Extension | ✅ Complete |
| Codeforces Scraper | ✅ Stable |
| Multi-Test Execution | ✅ Implemented |
| Diff Viewer | ✅ Implemented |
| Time & Memory Stats | ✅ Implemented |
| Settings UI | ✅ Functional |

---

## 🚀 NEXT STEPS (OPTIONAL)

### **For Users:**
1. Test on multiple Codeforces problems
2. Try different programming languages
3. Experiment with custom test cases

### **For Developers:**
1. Add custom icons
2. Extend to other platforms (AtCoder, LeetCode)
3. Add stress testing features
4. Implement Docker sandboxing
5. Contribute to open source

---

## 🐛 REPORTING ISSUES

If you encounter problems:

1. **Check troubleshooting section above**
2. **Enable debug mode:**
   ```bash
   DEBUG=true npm start
   ```
3. **Open issue on GitHub** with:
   - Operating system
   - Chrome version
   - Server logs
   - Browser console output

---

## 📝 NOTES

### **Memory Tracking**
- Memory statistics are **best-effort** and OS-dependent
- Linux: Most accurate
- macOS: May be inflated
- Windows: Less reliable

### **Extension Permissions**
- `activeTab`: Read problem pages
- `storage`: Save settings
- `scripting`: Inject content scripts
- `localhost:3000`: Connect to local server

### **Known Limitations**
- No custom checkers (uses line-by-line comparison)
- No sandboxing (suitable for local use only)
- Scraper may break if Codeforces changes DOM structure

---

## 🎓 PROFESSIONAL USE

This installation guide is production-ready and suitable for:
- ✅ Portfolio projects
- ✅ Interview demonstrations
- ✅ Team onboarding
- ✅ Open-source contributions
- ✅ Academic projects

---

## 📄 LICENSE

See LICENSE file for details.

---

## 🤝 CONTRIBUTING

Contributions welcome! See CONTRIBUTING.md for guidelines.

---

**Built with ❤️ for competitive programmers**
