/**
 * STRESS TEST: Infinite Loop
 * 
 * PURPOSE:
 * Test that the judge correctly:
 * - Detects infinite loops
 * - Kills process after timeout
 * - Returns TLE verdict
 * - Cleans up resources
 * 
 * EXPECTED BEHAVIOR:
 * - Verdict: TLE
 * - Execution time: ~timeLimit (1000-2000ms)
 * - Process killed: true
 * - No resource leak
 */

#include <iostream>
using namespace std;

int main() {
    // Infinite loop - should be killed by timeout
    while(true) {
        // Busy wait - CPU intensive
    }
    
    // This line should never execute
    cout << "This should not print" << endl;
    return 0;
}

/*
TEST INSTRUCTIONS:
1. Set time limit to 1000ms
2. Run this program
3. Verify:
   - Verdict = TLE
   - Execution time ≈ 1000ms
   - Process killed successfully
   - No zombie processes
   - Workspace cleaned up

PASS CRITERIA:
✓ TLE verdict within 1100ms (allowing small overhead)
✓ No console errors
✓ Server remains stable after kill

FAILURE MODES:
✗ Process not killed → Security issue
✗ Timeout > 2x limit → Kill mechanism broken
✗ Zombie process → Resource leak
*/
