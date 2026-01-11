/**
 * STRESS TEST: Output Spam
 * 
 * PURPOSE:
 * Test that the judge correctly:
 * - Handles very large output (100MB+)
 * - Doesn't crash on massive stdout
 * - Completes in reasonable time
 * - Properly compares output (or caps it)
 * 
 * EXPECTED BEHAVIOR:
 * - Verdict: WA (output too large) or AC (if expected matches)
 * - No memory overflow
 * - Server remains stable
 * - Reasonable execution time
 */

function generateMassiveOutput() {
    console.log("Starting output spam...");
    
    // Generate 100MB of output
    const lineCount = 1000000;  // 1 million lines
    const lineContent = "A".repeat(100);  // 100 characters per line
    
    for (let i = 0; i < lineCount; i++) {
        console.log(`${i}: ${lineContent}`);
        
        // Progress markers
        if (i % 100000 === 0) {
            console.error(`Progress: ${i / 1000}K lines`);
        }
    }
    
    console.log("Output spam complete");
}

try {
    generateMassiveOutput();
} catch (error) {
    console.error("Error:", error.message);
}

/*
TEST INSTRUCTIONS:
1. Set time limit to 5000ms
2. Run this program
3. Provide empty expected output
4. Verify:
   - Verdict = WA (output mismatch)
   - Execution completes
   - Server doesn't crash
   - Memory remains bounded
   - Diff generated (or capped)

PASS CRITERIA:
✓ Completes within 10 seconds
✓ Server remains responsive
✓ Memory usage stays reasonable
✓ Clean verdict returned

FAILURE MODES:
✗ Server hang → Output buffer overflow
✗ Memory leak → Output not released
✗ Crash → Unsafe output handling
✗ Timeout → Output comparison too slow

NOTE:
Real judges cap output:
- Typical limit: 10-50MB
- After limit: truncate or fail
- This tests your system's robustness

IMPROVEMENT:
Consider adding output size limit:
- Fail fast if output > 100MB
- Save memory and time
*/
