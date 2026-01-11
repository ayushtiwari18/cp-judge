/**
 * Manual Test Suite
 * 
 * RUN: node tests/manualTests.js
 * 
 * PREREQUISITES:
 * - Server must be running (node server.js)
 * - Compilers must be installed (g++, javac, python3, node)
 * 
 * TESTS:
 * 1. Health check
 * 2. Language listing
 * 3. C++ - Accepted
 * 4. C++ - Wrong Answer
 * 5. C++ - Compilation Error
 * 6. C++ - Runtime Error
 * 7. C++ - Time Limit Exceeded
 * 8. Python - Accepted
 * 9. Java - Accepted
 * 10. JavaScript - Accepted
 */

const BASE_URL = 'http://localhost:3000/api';

// Test programs
const TEST_PROGRAMS = {
  cpp_ac: {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    testCases: [
      { input: '2 3', expectedOutput: '5' },
      { input: '10 20', expectedOutput: '30' }
    ]
  },

  cpp_wa: {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // Wrong operation
    return 0;
}`,
    testCases: [
      { input: '2 3', expectedOutput: '5' }  // Expects 5, gets 6
    ]
  },

  cpp_ce: {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello" << endl
    return 0;  // Missing semicolon
}`,
    testCases: [
      { input: '', expectedOutput: 'Hello' }
    ]
  },

  cpp_re: {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    int arr[5];
    for (int i = 0; i <= 1000000; i++) {
        arr[i] = i;  // Array out of bounds
    }
    return 0;
}`,
    testCases: [
      { input: '', expectedOutput: '' }
    ]
  },

  cpp_tle: {
    language: 'cpp',
    code: `#include <iostream>
using namespace std;

int main() {
    while (true) {  // Infinite loop
        // Never exits
    }
    return 0;
}`,
    testCases: [
      { input: '', expectedOutput: '' }
    ]
  },

  python_ac: {
    language: 'python',
    code: `a, b = map(int, input().split())
print(a + b)`,
    testCases: [
      { input: '2 3', expectedOutput: '5' },
      { input: '100 200', expectedOutput: '300' }
    ]
  },

  java_ac: {
    language: 'java',
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
    testCases: [
      { input: '2 3', expectedOutput: '5' }
    ]
  },

  javascript_ac: {
    language: 'javascript',
    code: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const [a, b] = line.split(' ').map(Number);
    console.log(a + b);
    rl.close();
});`,
    testCases: [
      { input: '2 3', expectedOutput: '5' }
    ]
  }
};

async function runTest(testName, testData) {
  console.log(`\n\u2501━━ Testing: ${testName} ━━━`);
  
  try {
    const response = await fetch(`${BASE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\u2713 Test executed successfully');
      result.results.forEach((r, i) => {
        console.log(`  Test Case ${i + 1}: ${r.verdict} - ${r.message}`);
      });
    } else {
      console.log('\u2717 Execution failed');
      if (result.compilationError) {
        console.log('  Compilation Error:', result.compilationError.verdict);
      }
    }
    
    return result;
  } catch (error) {
    console.error('\u2717 Test failed with error:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
  console.log('  CP JUDGE - MANUAL TEST SUITE');
  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');

  // Test 1: Health check
  console.log('\n\u2501\u2501\u2501 Test 1: Health Check ━\u2501\u2501');
  try {
    const health = await fetch(`${BASE_URL}/health`);
    const healthData = await health.json();
    console.log('Health:', healthData);
    console.log('\u2713 Health check passed');
  } catch (error) {
    console.error('\u2717 Health check failed:', error.message);
    console.log('\nERROR: Server is not running!');
    console.log('Please start the server first: cd server && npm start');
    return;
  }

  // Test 2: Language listing
  console.log('\n\u2501\u2501\u2501 Test 2: Languages ━\u2501\u2501');
  try {
    const langs = await fetch(`${BASE_URL}/languages`);
    const langsData = await langs.json();
    console.log('Languages:', langsData);
    console.log('\u2713 Language listing passed');
  } catch (error) {
    console.error('\u2717 Language listing failed:', error.message);
  }

  // Run code execution tests
  await runTest('C++ - Accepted', TEST_PROGRAMS.cpp_ac);
  await runTest('C++ - Wrong Answer', TEST_PROGRAMS.cpp_wa);
  await runTest('C++ - Compilation Error', TEST_PROGRAMS.cpp_ce);
  await runTest('C++ - Runtime Error', TEST_PROGRAMS.cpp_re);
  await runTest('C++ - Time Limit Exceeded', TEST_PROGRAMS.cpp_tle);
  await runTest('Python - Accepted', TEST_PROGRAMS.python_ac);
  await runTest('Java - Accepted', TEST_PROGRAMS.java_ac);
  await runTest('JavaScript - Accepted', TEST_PROGRAMS.javascript_ac);

  console.log('\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
  console.log('  ALL TESTS COMPLETED');
  console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
}

runAllTests();
