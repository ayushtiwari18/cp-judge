# Stress Test Suite

## Purpose

These tests validate that the judge remains **stable under extreme conditions**.

Unlike normal test cases, stress tests are designed to:
- Push resource limits
- Test failure modes
- Validate kill mechanisms
- Ensure no system crashes

---

## Test Catalog

### 1. Infinite Loop (`infinite_loop.cpp`)

**What it tests:** Timeout enforcement

**How to run:**
1. Copy code to extension popup
2. Set time limit: 1000ms
3. Click "Run Tests"

**Expected result:**
```
Verdict: TLE
Execution time: ~1000ms (±100ms overhead)
Process killed: true
```

**Pass criteria:**
- ✓ TLE verdict
- ✓ Killed within 1.2x time limit
- ✓ No zombie processes
- ✓ Server remains responsive

**If fails:**
- Process not killed → Check `timeout.js` kill logic
- Time > 2x limit → Timeout mechanism broken
- Server hangs → Process cleanup issue

---

### 2. Memory Bomb (`memory_bomb.py`)

**What it tests:** Memory exhaustion handling

**How to run:**
1. Copy code to extension popup
2. Language: Python
3. Time limit: 5000ms
4. Click "Run Tests"

**Expected result:**
```
Verdict: TLE or RE
(Killed by timeout or OS memory limit)
```

**Pass criteria:**
- ✓ Process terminated
- ✓ System memory recovers
- ✓ No server crash
- ✓ Completes within 10 seconds

**Platform differences:**
- **Linux:** May enforce memory limit via ulimit
- **macOS:** Best-effort, likely timeout kill
- **Windows:** Timeout kill only

**If fails:**
- System hangs → Add output size limit
- Memory leak → Check process cleanup
- Server crash → Buffer overflow issue

---

### 3. Output Spam (`output_spam.js`)

**What it tests:** Large output handling

**How to run:**
1. Copy code to extension popup
2. Language: JavaScript
3. Expected output: (empty)
4. Click "Run Tests"

**Expected result:**
```
Verdict: WA
Output: (truncated or full)
Execution time: 2-5 seconds
```

**Pass criteria:**
- ✓ Completes within 10 seconds
- ✓ WA verdict (output mismatch)
- ✓ Server remains stable
- ✓ Memory usage bounded

**If fails:**
- Timeout → Output comparison too slow
- Memory spike → Output not streaming
- Crash → Buffer size issue

**Improvement opportunity:**
Add output size limit (e.g., 50MB cap)

---

## Running All Tests

### Manual Method

1. Start server: `npm start`
2. Open any Codeforces problem
3. Run each test one by one
4. Document results below

### Test Results Log

```
Date: ______
Platform: Linux / macOS / Windows
Node.js version: ______

Test 1 (infinite_loop.cpp):
  Verdict: ______
  Time: ______ms
  Killed: ______
  Status: PASS / FAIL

Test 2 (memory_bomb.py):
  Verdict: ______
  Time: ______ms
  Status: PASS / FAIL

Test 3 (output_spam.js):
  Verdict: ______
  Time: ______ms
  Status: PASS / FAIL

Overall: PASS / FAIL
Notes: ______
```

---

## Additional Stress Tests (Future)

### Fork Bomb (Linux only)
```bash
:(){ :|:& };:
```
**Danger:** Can crash system. Only test in VM.

### Path Traversal
```cpp
fstream f("../../../etc/passwd");
```
**Expected:** Fails due to workspace isolation

### Network Access
```python
import urllib.request
urllib.request.urlopen('http://example.com')
```
**Expected:** Succeeds (future: block with sandbox)

---

## Acceptance Criteria

Before calling the judge "production-ready":

- [ ] All 3 stress tests pass
- [ ] No system hangs
- [ ] No memory leaks
- [ ] Server remains stable
- [ ] Results documented

---

## Why These Tests Matter

1. **Infinite loop:** Most common beginner mistake
2. **Memory bomb:** Prevents system crashes
3. **Output spam:** Real CP problems can generate MB of output

If these pass, your judge handles **99% of edge cases**.

---

## Notes for Developers

- These tests are **destructive by design**
- Run in isolated environment first
- Document unexpected behaviors
- Update this file with findings

---

**Status:** Ready for testing
**Last updated:** 2026-01-11
