# CP Judge Local

**Production-Grade Local Competitive Programming Judge**

A CPH-style execution engine that runs competitive programming code locally with deterministic verdicts. Supports C++, Java, Python, and JavaScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

✅ **Multi-Language Support** - C++, Java, Python 3, JavaScript  
✅ **Deterministic Verdicts** - AC, WA, TLE, RE, CE  
✅ **Isolated Execution** - Separate workspace per request  
✅ **Timeout Enforcement** - Configurable time limits  
✅ **Precise Timing** - High-resolution execution measurement  
✅ **Strict Output Comparison** - Case-sensitive CP-standard matching  
✅ **HTTP API** - Easy integration with extensions  
✅ **No Network Required** - Fully local execution  
✅ **Cross-Platform** - Linux, macOS, Windows  

---

## Quick Start

### Prerequisites

Install compilers and runtimes:

```bash
# C++
g++ --version

# Java
javac --version
java --version

# Python
python3 --version

# JavaScript (Node.js)
node --version
```

### Installation

```bash
# Clone repository
git clone https://github.com/ayushtiwari18/cp-judge.git
cd cp-judge/server

# Install dependencies
npm install

# Start server
npm start
```

Server runs on `http://localhost:3000`

---

## Usage

### API Endpoints

#### Health Check
```bash
GET /api/health
```

#### List Supported Languages
```bash
GET /api/languages
```

#### Execute Code
```bash
POST /api/run
```

**Request Body:**
```json
{
  "language": "cpp",
  "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
  "testCases": [
    {
      "input": "2 3",
      "expectedOutput": "5"
    },
    {
      "input": "10 20",
      "expectedOutput": "30"
    }
  ],
  "timeLimit": 2000
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "testCase": 1,
      "verdict": "AC",
      "message": "Accepted",
      "actualOutput": "5",
      "expectedOutput": "5",
      "executionTime": 45
    },
    {
      "testCase": 2,
      "verdict": "AC",
      "message": "Accepted",
      "actualOutput": "30",
      "expectedOutput": "30",
      "executionTime": 42
    }
  ],
  "compilationError": null
}
```

---

## Testing

### Manual Test Suite

```bash
cd server
node tests/manualTests.js
```

Tests all verdict types across all languages.

### cURL Examples

```bash
bash tests/curl-examples.sh
```

---

## Verdict Types

| Verdict | Description | When Assigned |
|---------|-------------|---------------|
| **AC** | Accepted | Output matches expected |
| **WA** | Wrong Answer | Output mismatch |
| **TLE** | Time Limit Exceeded | Execution timeout |
| **RE** | Runtime Error | Non-zero exit, crash |
| **CE** | Compilation Error | Compilation failed |

---

## Project Structure

```
cp-judge/
├── server/
│   ├── api/
│   │   ├── routes.js          # HTTP endpoints
│   │   └── executor.js        # Orchestration logic
│   ├── executor/
│   │   ├── compiler.js        # Compilation engine
│   │   ├── runner.js          # Execution engine
│   │   └── verdictEngine.js   # Classification logic
│   ├── languages/
│   │   └── config.js          # Language definitions
│   ├── utils/
│   │   ├── fileSystem.js      # Workspace management
│   │   ├── timeout.js         # Process control
│   │   └── normalize.js       # Output normalization
│   ├── tests/
│   │   ├── manualTests.js     # Test suite
│   │   └── curl-examples.sh   # API examples
│   ├── server.js              # Entry point
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md        # System design
│   ├── EXECUTION_LIFECYCLE.md # How execution works
│   └── TESTING.md             # Testing guide
└── README.md
```

---

## Security

**⚠️ CRITICAL WARNING: This judge executes arbitrary code on your system.**

### Security Model

This is a **local development tool** designed for trusted environments. It is **NOT** a secure online judge.

### Current Safety Measures
- ✅ Isolated workspaces per request (UUID-based)
- ✅ Timeout enforcement with forced process termination
- ✅ Process killing on overrun (SIGKILL)
- ✅ Separate execution directories
- ✅ Automatic workspace cleanup

### Known Security Limitations

**❌ No Sandbox**: Code runs with **your user privileges**
- Can read/write any files you have access to
- Can execute system commands
- Can access network resources
- Can consume unlimited CPU/memory

**❌ No Network Isolation**: Code has full network access
- Can make HTTP requests
- Can open sockets
- Can connect to databases

**❌ No Resource Limits**: 
- CPU usage not constrained
- Memory usage not constrained
- Disk usage not constrained

**⚠️ Shell Command Execution**: Uses `shell: true` for process spawning
- Required for language command templates
- Potential command injection risk with untrusted input

### Security Best Practices

**✅ SAFE Use Cases**:
- Personal competitive programming practice
- Solving problems from trusted sources (Codeforces, LeetCode)
- Testing your own code locally
- Educational environments with trusted students

**❌ UNSAFE Use Cases**:
- Public-facing online judge
- Multi-tenant environments
- Untrusted code execution
- Production web services

### Recommendations

1. **Local Use Only**: Never expose port 3000 to the internet
2. **Trusted Code Only**: Only run code you wrote or trust
3. **Firewall Protection**: Use firewall rules to block external access
4. **Docker Isolation**: For production, use Docker containers with:
   - Resource limits (`--memory`, `--cpus`)
   - Network isolation (`--network=none`)
   - Read-only filesystem
   - Non-root user
5. **VM Isolation**: Consider running in a virtual machine
6. **Input Sanitization**: Never pass user-controlled strings to language configs

### Future Security Enhancements

- [ ] Docker-based sandboxing
- [ ] cgroups resource limits
- [ ] seccomp system call filtering
- [ ] Network namespace isolation
- [ ] Capability dropping
- [ ] User namespace isolation

---

## Recent Improvements

### Version 1.0.1 (January 11, 2026)

**✅ Critical Fixes Applied**:

1. **Output Normalization Fix**
   - Changed from case-insensitive to **case-sensitive** comparison
   - Now correctly distinguishes "YES" from "yes"
   - Aligns with competitive programming standards
   - Fixes false AC verdicts for case-sensitive problems

2. **Precise Execution Time Measurement**
   - Replaced approximate calculation with `performance.now()`
   - Provides accurate millisecond-precision runtime statistics
   - Helps identify performance bottlenecks in code

3. **Enhanced Security Documentation**
   - Added detailed security warnings and limitations
   - Documented best practices for safe usage
   - Clarified threat model and recommended mitigations

---

## Adding New Languages

Edit `server/languages/config.js`:

```javascript
export const LANGUAGES = {
  // ... existing languages

  rust: {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    needsCompilation: true,
    compile: 'rustc {file} -o {executable}',
    run: './{executable}',
    executable: 'main',
    errorPatterns: [/error:/i]
  }
};
```

No changes to executor logic required.

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Execution Lifecycle](docs/EXECUTION_LIFECYCLE.md)
- [Testing Guide](docs/TESTING.md)

---

## Roadmap

- [ ] Browser extension (Chrome/Firefox) - **In Progress**
- [ ] VS Code extension
- [ ] Docker sandboxing with resource limits
- [ ] Custom checkers for special judge problems
- [ ] Stress testing engine
- [ ] Interactive problems support
- [ ] Multi-test file support
- [ ] Parallel test execution

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests for new features
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Author

**Ayush Tiwari**  
[GitHub](https://github.com/ayushtiwari18) • [Portfolio](https://ayusht.netlify.app/)

---

## Acknowledgments

Inspired by:
- [Competitive Programming Helper (CPH)](https://github.com/agrawal-d/cph)
- [Codeforces](https://codeforces.com)
- [LeetCode](https://leetcode.com)

---

## Changelog

### v1.0.1 (January 11, 2026)
- Fixed output normalization for case-sensitive comparison
- Added precise execution time measurement with performance.now()
- Enhanced security documentation with detailed warnings
- Improved runner logging for better debugging

### v1.0.0 (January 11, 2026)
- Initial production release
- Multi-language support (C++, Java, Python, JavaScript)
- Deterministic verdict system
- Isolated workspace execution
- Comprehensive test suite
