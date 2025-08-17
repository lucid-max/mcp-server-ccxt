#!/usr/bin/env node
/**
 * CCXT MCP Server
 * High-performance cryptocurrency exchange interface with optimized caching and rate limiting
 * 
 * CCXT MCP 服务器
 * 具有优化缓存和速率限制的高性能加密货币交易所接口
 */

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

// Now we can safely import modules
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as ccxt from 'ccxt';
import dotenv from 'dotenv';

import { log, LogLevel, setLogLevel } from './utils/logging.js';
import { getCacheStats, clearCache } from './utils/cache.js';
import { rateLimiter } from './utils/rate-limiter.js';
import { SUPPORTED_EXCHANGES, getExchange } from './exchange/manager.js';
import { registerAllTools } from './tools/index.js';

// Load environment variables
// 加载环境变量
dotenv.config();

// Create MCP server
// 创建MCP服务器
const server = new McpServer({
  name: "CCXT MCP Server",
  version: "1.1.0",
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Resource: Exchanges list
// 资源：交易所列表
server.resource("exchanges", "ccxt://exchanges", async (uri) => {
  return {
    contents: [{
      uri: uri.href,
      text: JSON.stringify(SUPPORTED_EXCHANGES, null, 2)
    }]
  };
});

// Resource template: Markets
// 资源模板：市场
server.resource("markets", new ResourceTemplate("ccxt://{exchange}/markets", { list: undefined }), 
  async (uri, params) => {
    try {
      const exchange = params.exchange as string;
      const ex = getExchange(exchange);
      await ex.loadMarkets();
      
      const markets = Object.values(ex.markets).map(market => ({
        symbol: (market as any).symbol,
        base: (market as any).base,
        quote: (market as any).quote,
        active: (market as any).active,
      }));
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(markets, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching markets: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// Resource template: Ticker
// 资源模板：行情
server.resource("ticker", new ResourceTemplate("ccxt://{exchange}/ticker/{symbol}", { list: undefined }), 
  async (uri, params) => {
    try {
      const exchange = params.exchange as string;
      const symbol = params.symbol as string;
      const ex = getExchange(exchange);
      const ticker = await ex.fetchTicker(symbol);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(ticker, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching ticker: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// Resource template: Order book
// 资源模板：订单簿
server.resource("order-book", new ResourceTemplate("ccxt://{exchange}/orderbook/{symbol}", { list: undefined }), 
  async (uri, params) => {
    try {
      const exchange = params.exchange as string;
      const symbol = params.symbol as string;
      const ex = getExchange(exchange);
      const orderbook = await ex.fetchOrderBook(symbol);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(orderbook, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching order book: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// Cache statistics tool
// 缓存统计工具
server.tool("cache-stats", "Get CCXT cache statistics", {}, async () => {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(getCacheStats(), null, 2)
    }]
  };
});

// Cache clearing tool
// 缓存清理工具
server.tool("clear-cache", "Clear CCXT cache", {}, async () => {
  clearCache();
  return {
    content: [{
      type: "text",
      text: "Cache cleared successfully."
    }]
  };
});

// // Log level management
// // 日志级别管理
// server.tool("set-log-level", "Set logging level", {
//   level: z.enum(["debug", "info", "warning", "error"]).describe("Logging level to set")
// }, async ({ level }) => {
//   setLogLevel(level);
//   return {
//     content: [{
//       type: "text",
//       text: `Log level set to ${level}.`
//     }]
//   };
// });

// Start the server
// 启动服务器
async function main() {
  try {
    log(LogLevel.INFO, "Starting CCXT MCP Server...");
    
    // Register all tools
    registerAllTools(server);
    
    // Configure transport to use pure stdio
    // 配置传输以使用纯stdio
    const transport = new StdioServerTransport();
    
    // Connect to stdio transport
    await server.connect(transport);
    
    log(LogLevel.INFO, "CCXT MCP Server is running");
  } catch (error) {
    log(LogLevel.ERROR, `Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('uncaughtException', (error) => {
  log(LogLevel.ERROR, `Uncaught exception: ${error.message}`);
  log(LogLevel.ERROR, error.stack || 'No stack trace');
});

process.on('unhandledRejection', (reason) => {
  log(LogLevel.ERROR, `Unhandled rejection: ${reason}`);
});

// Start the MCP server
main();