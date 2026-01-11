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

**⚠️ WARNING: This judge executes arbitrary code.**

### Current Safety Measures
- Isolated workspaces per request
- Timeout enforcement
- Process killing on overrun
- Separate execution directories

### Known Limitations
- **No sandbox**: Code runs with user privileges
- **No network isolation**: Code can access network
- **No resource limits**: CPU/memory not constrained

### Recommendations
- **DO NOT** expose to public internet
- **USE ONLY** for personal/trusted code
- **CONSIDER** Docker/containerization for production

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

- [ ] Browser extension (Chrome/Firefox)
- [ ] VS Code extension
- [ ] Docker sandboxing
- [ ] Resource limits (CPU/memory)
- [ ] Stress testing engine
- [ ] Custom checkers
- [ ] Interactive problems

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
