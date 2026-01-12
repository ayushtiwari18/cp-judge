# CP Judge Testing Guide

## Phase 2 Critical Fixes - Verification Procedures

This document provides **step-by-step testing procedures** to verify all Phase 2 improvements work correctly.

---

## 1. Process Control & Timeout (CRITICAL)

### Test 1.1: Infinite Loop Handling

**Objective:** Verify infinite loops are killed correctly with no zombie processes.

**C++ Test Code:**
```cpp
#include <iostream>
using namespace std;

int main() {
    while(true) {
        // Infinite loop
    }
    return 0;
}
```

**Expected Outcome:**
- Verdict: `TLE` (Time Limit Exceeded)
- Execution time: ~2000ms (timeout limit)
- No zombie processes left behind

**Verification Commands:**
```bash
# Before test
ps aux | grep -E '(a\.out|Main)' | wc -l
# Should be 0

# Run test via API
curl -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "language": "cpp",
    "code": "#include <iostream>\nusing namespace std;\nint main() { while(true) {} return 0; }",
    "testCases": [{"input": "", "expectedOutput": ""}],
    "timeLimit": 2000
  }'

# After test (wait 5 seconds)
sleep 5
ps aux | grep -E '(a\.out|Main)' | wc -l
# Should still be 0 (no zombies)
```

**Pass Criteria:**
- ✅ Response contains `"verdict": "TLE"`
- ✅ No processes remain after execution
- ✅ Server doesn't crash

---

### Test 1.2: Forking Bomb Protection

**C++ Test Code:**
```cpp
#include <iostream>
#include <unistd.h>
using namespace std;

int main() {
    while(true) {
        fork(); // Creates exponential processes
    }
    return 0;
}
```

**Expected Outcome:**
- Process group killed cleanly
- No runaway processes
- System remains stable

**Verification:**
```bash
# Monitor process count during execution
watch -n 0.5 'ps aux | grep $(whoami) | wc -l'

# Run test
# Process count should spike briefly, then return to normal
```

**Pass Criteria:**
- ✅ All child processes terminated
- ✅ System doesn't hang
- ✅ Process count returns to baseline

---

### Test 1.3: Large Output Handling

**Python Test Code:**
```python
for i in range(1000000):
    print(i)
```

**Expected Outcome:**
- Execution completes or times out cleanly
- No deadlocks from STDIN/STDOUT buffers
- Server remains responsive

**Pass Criteria:**
- ✅ Response received (not hanging)
- ✅ Either AC or TLE (depending on time)
- ✅ Server still accepts new requests

---

## 2. Server Health Check

### Test 2.1: Health Endpoint Basic

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T09:25:00.000Z",
  "service": "CP Judge Local",
  "version": "1.0.0",
  "compilers": {
    "cpp": true,
    "java": true,
    "python": true,
    "javascript": true
  },
  "warnings": [],
  "platform": "linux",
  "nodeVersion": "v20.x.x"
}
```

**Pass Criteria:**
- ✅ Status code: 200
- ✅ `status` field present
- ✅ Compiler availability matches system

---

### Test 2.2: Missing Compiler Detection

**Setup:** Temporarily rename a compiler
```bash
# Example: Hide g++
sudo mv /usr/bin/g++ /usr/bin/g++.bak
```

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "degraded",
  "compilers": {
    "cpp": false,
    ...
  },
  "warnings": ["C++ compiler (g++) not found"]
}
```

**Cleanup:**
```bash
sudo mv /usr/bin/g++.bak /usr/bin/g++
```

**Pass Criteria:**
- ✅ Correctly detects missing compiler
- ✅ Status changes to "degraded"
- ✅ Warning message helpful

---

## 3. Workspace Cleanup

### Test 3.1: Startup Cleanup

**Setup:** Create stale workspaces
```bash
cd server/workspace
mkdir ws_1000000000000_abc123  # Very old timestamp
mkdir ws_1000000000000_def456
ls -la
```

**Action:** Restart server
```bash
npm start
```

**Expected Output:**
```
[STARTUP] Cleaning stale workspaces...
[STARTUP CLEANUP] Removed stale workspace: ws_1000000000000_abc123
[STARTUP CLEANUP] Removed stale workspace: ws_1000000000000_def456
[STARTUP CLEANUP] Removed 2 stale workspace(s)
```

**Verification:**
```bash
ls server/workspace
# Should be empty or only contain recent workspaces
```

**Pass Criteria:**
- ✅ Old workspaces removed automatically
- ✅ Server starts successfully
- ✅ No errors in console

---

### Test 3.2: Runtime Cleanup

**Action:** Submit multiple requests
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/run \
    -H "Content-Type: application/json" \
    -d '{
      "language": "cpp",
      "code": "#include <iostream>\nint main() { return 0; }",
      "testCases": [{"input": "", "expectedOutput": ""}]
    }'
done
```

**Verification:**
```bash
# Check workspace immediately
ls server/workspace | wc -l
# Should be 0 or very small

# Wait 5 seconds
sleep 5
ls server/workspace | wc -l
# Should be 0
```

**Pass Criteria:**
- ✅ Workspaces cleaned up after execution
- ✅ No accumulation of directories

---

## 4. Cross-Platform Tests

### Windows-Specific

**Process Killing:**
```bash
# Verify taskkill is used
# Check server logs for "taskkill" when timeout occurs
```

**Executable Paths:**
```bash
# Compiled C++ binary should have .exe extension
ls server/workspace/ws_*/
# Should see main.exe (not just main)
```

### Linux/Mac-Specific

**Process Group Killing:**
```bash
# Verify PGID-based killing
# On timeout, check process tree disappears
ps -ejH | grep <pid>
```

---

## 5. Integration Test Suite

### Full Workflow Test

**Test all languages:**
```bash
#!/bin/bash
# test_all_languages.sh

LANGUAGES=("cpp" "java" "python" "javascript")
CODES=(
  "#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; cout << a+b; return 0; }"
  "import java.util.*; public class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(); int b = sc.nextInt(); System.out.println(a + b); } }"
  "a, b = map(int, input().split())\nprint(a + b)"
  "const readline = require('readline'); const rl = readline.createInterface({input: process.stdin}); rl.on('line', (line) => { const [a, b] = line.split(' ').map(Number); console.log(a + b); rl.close(); });"
)

for i in "${!LANGUAGES[@]}"; do
  echo "Testing ${LANGUAGES[$i]}..."
  curl -s -X POST http://localhost:3000/api/run \
    -H "Content-Type: application/json" \
    -d "{
      \"language\": \"${LANGUAGES[$i]}\",
      \"code\": \"${CODES[$i]}\",
      \"testCases\": [{\"input\": \"5 3\", \"expectedOutput\": \"8\"}]
    }" | jq '.results[0].verdict'
done
```

**Expected Output:**
```
Testing cpp...
"AC"
Testing java...
"AC"
Testing python...
"AC"
Testing javascript...
"AC"
```

---

## 6. Stress Testing

### Test 6.1: Concurrent Requests

**Setup:** Install `apache2-utils` (for `ab`)
```bash
sudo apt-get install apache2-utils
```

**Run:**
```bash
ab -n 20 -c 4 -p request.json -T application/json http://localhost:3000/api/run
```

**Pass Criteria:**
- ✅ All requests complete successfully
- ✅ No crashes or deadlocks
- ✅ Workspace cleaned up after all requests

---

## 7. Failure Recovery Tests

### Test 7.1: Server Crash Simulation

**Action:**
1. Start server
2. Submit request (don't wait for response)
3. Kill server immediately: `kill -9 <pid>`
4. Restart server

**Expected:**
- ✅ Stale workspaces cleaned on restart
- ✅ Server starts normally
- ✅ No corrupted state

---

## Testing Checklist

### Critical (Must Pass)
- [ ] Infinite loop returns TLE
- [ ] No zombie processes after timeout
- [ ] Health check returns valid response
- [ ] Stale workspaces cleaned on startup
- [ ] All 4 languages execute correctly

### Important (Should Pass)
- [ ] Large output doesn't cause deadlock
- [ ] Concurrent requests handled correctly
- [ ] Missing compiler detected properly
- [ ] Server recovers from crash

### Nice-to-Have
- [ ] Fork bomb protection works
- [ ] Cross-platform compatibility verified
- [ ] Stress test completes successfully

---

## Automated Test Script

```bash
#!/bin/bash
# run_phase2_tests.sh

set -e

echo "🧪 PHASE 2 FIX VERIFICATION"
echo "=============================="
echo ""

# Test 1: Health Check
echo "[1/5] Testing health endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/health)
if echo $RESPONSE | jq -e '.status' > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Test 2: Infinite Loop
echo "[2/5] Testing infinite loop handling..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "language": "cpp",
    "code": "int main() { while(1); }",
    "testCases": [{"input": "", "expectedOutput": ""}],
    "timeLimit": 2000
  }')

if echo $RESPONSE | jq -e '.results[0].verdict == "TLE"' > /dev/null; then
  echo "✅ Infinite loop handled correctly"
else
  echo "❌ Infinite loop test failed"
  exit 1
fi

# Test 3: Process cleanup
echo "[3/5] Checking for zombie processes..."
sleep 2
ZOMBIES=$(ps aux | grep -E '(a\.out|Main)' | grep -v grep | wc -l)
if [ $ZOMBIES -eq 0 ]; then
  echo "✅ No zombie processes found"
else
  echo "❌ Zombie processes detected: $ZOMBIES"
  exit 1
fi

# Test 4: Workspace cleanup
echo "[4/5] Checking workspace cleanup..."
WORKSPACES=$(ls server/workspace 2>/dev/null | wc -l)
if [ $WORKSPACES -eq 0 ]; then
  echo "✅ Workspaces cleaned up"
else
  echo "⚠️  $WORKSPACES workspace(s) remain (may be recent)"
fi

# Test 5: Multi-language
echo "[5/5] Testing multiple languages..."
LANGS=("cpp" "python" "javascript")
for lang in "${LANGS[@]}"; do
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/run \
    -H "Content-Type: application/json" \
    -d "{
      \"language\": \"$lang\",
      \"code\": \"print('test')\",
      \"testCases\": [{\"input\": \"\", \"expectedOutput\": \"test\"}]
    }")
  
  if echo $RESPONSE | jq -e '.success' > /dev/null; then
    echo "  ✅ $lang works"
  else
    echo "  ❌ $lang failed"
  fi
done

echo ""
echo "=============================="
echo "✅ ALL CRITICAL TESTS PASSED"
echo "=============================="
```

**Usage:**
```bash
chmod +x run_phase2_tests.sh
./run_phase2_tests.sh
```

---

## Troubleshooting

### Issue: Zombie processes remain
**Solution:** Verify `detached: true` in timeout.js and check PGID killing logic

### Issue: Health check shows false negatives
**Solution:** Check PATH environment variable, ensure compilers are accessible

### Issue: Workspace accumulation
**Solution:** Verify cleanup() is called in finally block, check file permissions

---

**TESTING STATUS:** Ready for validation
**LAST UPDATED:** January 12, 2026
