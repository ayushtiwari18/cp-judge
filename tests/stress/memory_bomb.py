#!/usr/bin/env python3
"""
STRESS TEST: Memory Bomb

PURPOSE:
Test that the judge correctly:
- Detects excessive memory usage
- Kills process when memory limit exceeded
- Returns appropriate verdict (TLE or RE)
- No system hang

EXPECTED BEHAVIOR:
- Verdict: TLE (killed by OS) or RE (out of memory)
- Process killed before consuming all system RAM
- No system instability
"""

def memory_bomb():
    """
    Rapidly allocate memory until killed
    """
    data = []
    chunk_size = 10 * 1024 * 1024  # 10MB chunks
    
    print("Starting memory bomb...")
    
    try:
        while True:
            # Allocate 10MB of memory per iteration
            chunk = bytearray(chunk_size)
            data.append(chunk)
            
            # Fill with data to ensure actual allocation
            for i in range(len(chunk)):
                chunk[i] = i % 256
            
            # Print progress (will be killed before many prints)
            if len(data) % 10 == 0:
                print(f"Allocated {len(data) * 10}MB")
    
    except MemoryError:
        print(f"MemoryError after {len(data) * 10}MB")
    except KeyboardInterrupt:
        print("Interrupted")

if __name__ == "__main__":
    memory_bomb()
    print("This should not print")

"""
TEST INSTRUCTIONS:
1. Set memory limit to 256MB (if supported)
2. Run this program
3. Verify:
   - Process killed within reasonable time
   - No system hang
   - Memory freed after kill
   - Server remains stable

PASS CRITERIA:
✓ Process killed (any verdict acceptable)
✓ System memory recovers
✓ No server crash
✓ Execution completes within 10 seconds

FAILURE MODES:
✗ System hangs → Memory limit not enforced
✗ Server crashes → Unsafe process management
✗ Memory not freed → Resource leak

NOTE:
Memory limits are OS-dependent:
- Linux: ulimit enforced
- macOS: Best-effort
- Windows: Not enforced (monitoring only)
"""
