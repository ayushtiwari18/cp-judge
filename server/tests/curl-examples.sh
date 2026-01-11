#!/bin/bash

# CP Judge - cURL Test Examples
# Run these commands to manually test the API

BASE_URL="http://localhost:3000/api"

echo "================================"
echo "CP JUDGE - cURL TEST EXAMPLES"
echo "================================"

# Test 1: Health Check
echo -e "\n--- Test 1: Health Check ---"
curl -X GET "$BASE_URL/health" | jq

# Test 2: List Languages
echo -e "\n--- Test 2: List Languages ---"
curl -X GET "$BASE_URL/languages" | jq

# Test 3: C++ Accepted
echo -e "\n--- Test 3: C++ Accepted ---"
curl -X POST "$BASE_URL/run" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "cpp",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
    "testCases": [
      {"input": "2 3", "expectedOutput": "5"},
      {"input": "10 20", "expectedOutput": "30"}
    ]
  }' | jq

# Test 4: Python Accepted
echo -e "\n--- Test 4: Python Accepted ---"
curl -X POST "$BASE_URL/run" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "a, b = map(int, input().split())\nprint(a + b)",
    "testCases": [
      {"input": "5 7", "expectedOutput": "12"}
    ]
  }' | jq

echo -e "\n================================"
echo "Tests completed!"
echo "================================"
