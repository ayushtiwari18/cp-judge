# Testing Guide

## Overview

This document lists **all critical edge cases** that must pass for the judge to be considered stable and production-ready.

---

## 🧪 Core Functionality Tests

### ✅ 1. Correct Answer (AC)

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 2 << endl;
    return 0;
}
```

**Input:** `5`
**Expected Output:** `10`
**Expected Verdict:** `AC`

---

### ❌ 2. Wrong Answer (WA)

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 3 << endl;  // Wrong multiplication
    return 0;
}
```

**Input:** `5`
**Expected Output:** `10`
**Actual Output:** `15`
**Expected Verdict:** `WA`
**Expected:** Diff showing line difference

---

### ⏱️ 3. Time Limit Exceeded (TLE)

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    while(true) {  // Infinite loop
        // Do nothing
    }
    return 0;
}
```

**Time Limit:** 1000ms
**Expected Verdict:** `TLE`
**Expected:** Process killed after timeout

---

### 💥 4. Runtime Error (RE) - Segmentation Fault

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int* ptr = nullptr;
    *ptr = 42;  // Segfault
    return 0;
}
```

**Expected Verdict:** `RE`
**Expected:** Non-zero exit code detected

---

### 💥 5. Runtime Error (RE) - Divide by Zero

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int y = 0;
    cout << x / y << endl;
    return 0;
}
```

**Expected Verdict:** `RE` or crashes

---

### 🔧 6. Compilation Error (CE)

**Test Case:**
```cpp
#include <iostream>

int main() {
    cout << "Hello" << endl  // Missing semicolon
    return 0;
}
```

**Expected Verdict:** `CE`
**Expected:** Compilation error message displayed

---

## 📊 Edge Case Tests

### 7. Empty Output

**Test Case:**
```cpp
int main() {
    // Produces no output
    return 0;
}
```

**Expected Output:** (empty)
**Expected Verdict:** Should handle gracefully

---

### 8. Extra Whitespace

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "10  " << endl;  // Extra spaces
    return 0;
}
```

**Expected Output:** `10`
**Expected Verdict:** `AC` (normalization should handle)

---

### 9. Extra Newlines

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "10\n\n\n";  // Extra newlines
    return 0;
}
```

**Expected Output:** `10`
**Expected Verdict:** `AC` (normalization should handle)

---

### 10. Huge Input (10⁵ lines)

**Test Case:** Generate large input programmatically

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for(int i = 0; i < n; i++) {
        int x;
        cin >> x;
        cout << x << endl;
    }
    return 0;
}
```

**Input:** 100,000 numbers
**Expected:** Should handle without crashing
**Memory:** Should stay within limits

---

### 11. Multiple Languages Back-to-Back

**Test:** Run C++, then Python, then Java, then JS in sequence

**Expected:**
- All execute correctly
- No workspace conflicts
- Proper cleanup between runs

---

### 12. Unicode/Special Characters

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello 世界 🌍" << endl;
    return 0;
}
```

**Expected:** Handle UTF-8 correctly

---

## 🔒 Security Tests

### 13. Network Access Attempt

**Test Case:**
```cpp
#include <cstdlib>
int main() {
    system("curl http://example.com");
    return 0;
}
```

**Expected:** Either blocked or contained
**Note:** Future improvement with sandboxing

---

### 14. File System Access

**Test Case:**
```cpp
#include <fstream>
using namespace std;

int main() {
    ofstream file("/etc/passwd");
    file << "malicious";
    return 0;
}
```

**Expected:** Should fail (permission denied)
**Workspace isolation:** Must be enforced

---

### 15. Path Traversal Attempt

**Test Case:**
```cpp
#include <fstream>
using namespace std;

int main() {
    ofstream file("../../../etc/passwd");
    return 0;
}
```

**Expected:** Contained within workspace

---

## 🧠 Memory Tests

### 16. Memory Leak

**Test Case:**
```cpp
#include <iostream>
using namespace std;

int main() {
    while(true) {
        int* leak = new int[1000000];
        // No delete
    }
    return 0;
}
```

**Expected:** Should be killed by timeout or memory limit

---

### 17. Stack Overflow

**Test Case:**
```cpp
void recurse() {
    recurse();
}

int main() {
    recurse();
    return 0;
}
```

**Expected Verdict:** `RE` (stack overflow)

---

## 📋 Testing Checklist

Before releasing:

- [ ] All AC cases pass
- [ ] All WA cases show correct diff
- [ ] TLE correctly kills process
- [ ] RE properly detected
- [ ] CE shows compilation errors
- [ ] Empty output handled
- [ ] Whitespace normalization works
- [ ] Large inputs don't crash
- [ ] Multi-language execution stable
- [ ] Workspace cleanup verified
- [ ] Memory tracking reasonable
- [ ] Time tracking accurate
- [ ] No file system escape
- [ ] Process isolation works

---

## 🎯 Automated Testing

Future improvement: Create automated test suite

```bash
# Run all tests
npm test

# Run specific category
npm test -- security
npm test -- edge-cases
```

---

## 📊 Performance Benchmarks

| Test Type | Expected Time | Expected Memory |
|-----------|---------------|------------------|
| Simple I/O | < 10ms | < 20MB |
| Loop (10⁶) | < 100ms | < 50MB |
| String manipulation | < 50ms | < 100MB |

---

## ✅ Test Status

Update this section after running tests:

```
Last tested: YYYY-MM-DD
Platform: Linux/macOS/Windows
All critical tests: PASS/FAIL
Known issues: None/List
```

---

**Note:** This is a living document. Add new edge cases as they are discovered.
