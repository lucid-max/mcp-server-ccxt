#!/usr/bin/env node

/**
 * CCXT MCP Server - Command Line Interface
 * 
 * This file provides a CLI wrapper around the main server functionality,
 * making it easier to start the server from the command line when installed globally.
 */

// Simple version check for CCXT compatibility
try {
  const ccxt = await import('ccxt');
  const version = ccxt.version;
  if (version) {
    const versionParts = version.split('.');
    const major = parseInt(versionParts[0], 10);
    const minor = parseInt(versionParts[1], 10);
    
    if (major < 4 || (major === 4 && minor < 0)) {
      console.error('\x1b[33m%s\x1b[0m', `Warning: Your CCXT version (${version}) may be outdated. This MCP server is tested with CCXT 4.4.71+`);
    }
  }
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Error checking CCXT version:', error.message);
}

// Import and run the main server module
import '../build/index.js';

// The server itself is started by the imported module
// No additional code needed here as the imported module sets up process handlers
