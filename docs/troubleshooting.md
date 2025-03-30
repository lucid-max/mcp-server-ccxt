# Troubleshooting MCP-CCXT Server

This document contains common issues and solutions for the MCP-CCXT server.

## MCP Communication Errors

### Problem: JSON Parse Errors

**Error message:**
```
Error from MCP server: SyntaxError: Unexpected non-whitespace character after JSON at position 4 (line 1 column 5)
```

**Cause:**
This error occurs when non-protocol messages are being output to stdout, which interferes with the MCP protocol communication. MCP uses the standard input/output streams for protocol messages, so any logging or debugging output sent to stdout will corrupt the protocol.

**Solutions:**

1. **Run the error fix script:**

   ```bash
   # Make the script executable if needed
   chmod +x fix-mcp-errors.sh
   
   # Run the script
   ./fix-mcp-errors.sh
   ```

2. **Manual fixes:**

   a. **Redirect console output to stderr:**
   
   Make sure all console logs go to stderr by adding this at the top of `src/index.ts`:
   
   ```javascript
   // IMPORTANT: Redirect all console output to stderr to avoid messing with MCP protocol
   const originalConsoleLog = console.log;
   const originalConsoleInfo = console.info;
   const originalConsoleWarn = console.warn;
   const originalConsoleDebug = console.debug;
   
   console.log = (...args) => console.error('[LOG]', ...args);
   console.info = (...args) => console.error('[INFO]', ...args);
   console.warn = (...args) => console.error('[WARN]', ...args);
   console.debug = (...args) => console.error('[DEBUG]', ...args);
   ```
   
   b. **Update StdioServerTransport initialization:**
   
   Make sure to initialize the StdioServerTransport with debug disabled:
   
   ```javascript
   const transport = new StdioServerTransport({
     debug: false  // Important: disable any debug output from the transport
   });
   ```
   
   c. **Update logging.ts to use stderr:**
   
   Make sure all console outputs in `src/utils/logging.ts` use `console.error()` instead of `console.log()`, `console.info()`, or `console.debug()`.

3. **Redirect stderr when running:**

   If you still need to see debug output, you can redirect stderr to a file while keeping stdout clean for MCP communication:
   
   ```bash
   node build/index.js 2> debug.log
   ```

### Problem: Connection Timeouts or Unexpected Disconnects

**Cause:**
This may be caused by high CPU usage in the MCP server or errors that aren't properly handled.

**Solutions:**

1. **Increase error handling:**
   
   Make sure error handling is in place for all async functions, especially within resource and tool handlers.

2. **Monitor performance:**
   
   Reduce the number of concurrent requests or increase the TTL for cached data to reduce CPU usage.

## Configuration Issues

### Problem: Exchange API Keys Not Working

**Cause:**
The environment variables might not be loaded correctly, or the API keys may not have the required permissions.

**Solutions:**

1. **Check .env file:**
   
   Make sure your `.env` file exists and has the correct API key format:
   
   ```
   BINANCE_API_KEY=your_actual_api_key
   BINANCE_SECRET=your_actual_secret
   ```

2. **Verify API key permissions:**
   
   Ensure your API keys have the permissions needed for the operations you're trying to perform.

### Problem: Rate Limiting Issues

**Cause:**
Hitting exchange API rate limits too frequently.

**Solution:**

Adjust the rate limiter parameters in `src/utils/rate-limiter.ts`:

```javascript
// Increase default interval between requests (in ms)
constructor(defaultMinInterval = 500, defaultConcurrency = 1) {
  this.defaultMinInterval = defaultMinInterval;
  this.defaultConcurrency = defaultConcurrency;
}
```

## Using Claude for Desktop with MCP-CCXT

When configuring Claude for Desktop to use this MCP server, make sure to set up your `claude_desktop_config.json` correctly:

```json
{
  "mcpServers": {
    "ccxt": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-server-ccxt/build/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

You can also redirect stderr to a file for debugging:

```json
{
  "mcpServers": {
    "ccxt": {
      "command": "bash",
      "args": [
        "-c",
        "node /absolute/path/to/mcp-server-ccxt/build/index.js 2> /tmp/ccxt-debug.log"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Still Having Issues?

If you're still experiencing problems after trying these solutions, please:

1. Open an issue on the GitHub repository with detailed information about your problem
2. Include any error messages and stack traces
3. Describe the steps to reproduce the issue
