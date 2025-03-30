#!/bin/bash

# MCP Error Fix Script
# This script applies common fixes for MCP communication issues

echo "Applying fixes for MCP communication issues..."

# 1. Make sure all console output goes to stderr
echo "1. Fixing console output redirection in index.ts..."
cat <<'EOF' > /tmp/console_redirect.js
// IMPORTANT: Redirect all console output to stderr to avoid messing with MCP protocol
// This must be done before any imports that may log to console
// 重要：将所有控制台输出重定向到stderr，避免干扰MCP协议
// 这必须在任何可能记录到控制台的导入之前完成
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;

console.log = (...args) => console.error('[LOG]', ...args);
console.info = (...args) => console.error('[INFO]', ...args);
console.warn = (...args) => console.error('[WARN]', ...args);
console.debug = (...args) => console.error('[DEBUG]', ...args);
EOF

# Check if the redirect is already in index.ts
if grep -q "Redirect all console output to stderr" src/index.ts; then
  echo "   Redirection already exists, skipping..."
else
  # Add the redirect after the first comment block
  awk 'BEGIN{p=0} /^\s*\*\//{if(p==0){p=1;print;print "";cat "/tmp/console_redirect.js";next}} 1' src/index.ts > src/index.ts.new
  mv src/index.ts.new src/index.ts
  echo "   Added console output redirection to index.ts"
fi

# 2. Make sure StdioServerTransport has debug: false
echo "2. Ensuring StdioServerTransport has debug disabled..."
sed -i '' 's/new StdioServerTransport()/new StdioServerTransport({ debug: false })/g' src/index.ts
sed -i '' 's/new StdioServerTransport({/new StdioServerTransport({ debug: false,/g' src/index.ts

# 3. Update logging functions
echo "3. Ensuring logging functions use console.error..."
sed -i '' 's/console\.debug(/console.error(/g' src/utils/logging.ts
sed -i '' 's/console\.info(/console.error(/g' src/utils/logging.ts
sed -i '' 's/console\.warn(/console.error(/g' src/utils/logging.ts

# 4. Build the project
echo "4. Building the project..."
npm run build

echo ""
echo "Fixes applied successfully! Try running the server again."
echo "If you still encounter issues, please run 'node build/index.js 2> debug.log' to send all"
echo "debug output to a file while keeping stdout clean for MCP communication."
echo ""