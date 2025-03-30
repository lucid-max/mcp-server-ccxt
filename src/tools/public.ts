/**
 * Public API Tools
 * Tools for accessing public cryptocurrency exchange data
 * 
 * 公共API工具
 * 用于访问公共加密货币交易所数据的工具
 */
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getExchange, validateSymbol, SUPPORTED_EXCHANGES } from '../exchange/manager.js';
import { getCachedData } from '../utils/cache.js';
import { rateLimiter } from '../utils/rate-limiter.js';
import { log, LogLevel } from '../utils/logging.js';

export function registerPublicTools(server: McpServer) {
  // List supported exchanges
  // 列出支持的交易所
  server.tool("list-exchanges", "List all available cryptocurrency exchanges", {}, 
    async () => {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(SUPPORTED_EXCHANGES, null, 2)
        }]
      };
    }
  );

  // Get ticker information
  // 获取行情信息
  server.tool("get-ticker", "Get current ticker information for a trading pair", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbol: z.string().describe("Trading pair symbol (e.g., BTC/USDT)")
  }, async ({ exchange, symbol }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `ticker:${exchange}:${symbol}`;
        
        const ticker = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching ticker for ${symbol} on ${exchange}`);
          return await ex.fetchTicker(symbol);
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(ticker, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching ticker: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Batch get tickers
  // 批量获取行情
  server.tool("batch-get-tickers", "Get ticker information for multiple trading pairs at once", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbols: z.array(z.string()).describe("List of trading pair symbols (e.g., ['BTC/USDT', 'ETH/USDT'])")
  }, async ({ exchange, symbols }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `tickers:${exchange}:${symbols.join(',')}`;
        
        const tickers = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Batch fetching tickers for ${symbols.length} symbols on ${exchange}`);
          return await ex.fetchTickers(symbols);
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(tickers, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error batch fetching tickers: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Get order book
  // 获取订单簿
  server.tool("get-orderbook", "Get market order book for a trading pair", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbol: z.string().describe("Trading pair symbol (e.g., BTC/USDT)"),
    limit: z.number().optional().default(20).describe("Depth of the orderbook")
  }, async ({ exchange, symbol, limit }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `orderbook:${exchange}:${symbol}:${limit}`;
        
        const orderbook = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching orderbook for ${symbol} on ${exchange}, depth: ${limit}`);
          return await ex.fetchOrderBook(symbol, limit);
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(orderbook, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching orderbook: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Get OHLCV data
  // 获取K线数据
  server.tool("get-ohlcv", "Get OHLCV candlestick data for a trading pair", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbol: z.string().describe("Trading pair symbol (e.g., BTC/USDT)"),
    timeframe: z.string().optional().default("1d").describe("Timeframe (e.g., 1m, 5m, 1h, 1d)"),
    limit: z.number().optional().default(100).describe("Number of candles to fetch (max 1000)")
  }, async ({ exchange, symbol, timeframe, limit }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `ohlcv:${exchange}:${symbol}:${timeframe}:${limit}`;
        
        const ohlcv = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching OHLCV for ${symbol} on ${exchange}, timeframe: ${timeframe}, limit: ${limit}`);
          return await ex.fetchOHLCV(symbol, timeframe, undefined, limit);
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(ohlcv, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching OHLCV data: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Get recent trades
  // 获取最近交易
  server.tool("get-trades", "Get recent trades for a trading pair", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbol: z.string().describe("Trading pair symbol (e.g., BTC/USDT)"),
    limit: z.number().optional().default(50).describe("Number of trades to fetch")
  }, async ({ exchange, symbol, limit }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `trades:${exchange}:${symbol}:${limit}`;
        
        const trades = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching trades for ${symbol} on ${exchange}, limit: ${limit}`);
          return await ex.fetchTrades(symbol, undefined, limit);
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(trades, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching trades: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Get exchange markets
  // 获取交易所市场
  server.tool("get-markets", "Get all available markets for an exchange", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    page: z.number().optional().default(1).describe("Page number"),
    pageSize: z.number().optional().default(100).describe("Items per page")
  }, async ({ exchange, page, pageSize }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `markets:${exchange}`;
        
        const allMarkets = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching all markets for ${exchange}`);
          await ex.loadMarkets();
          return Object.values(ex.markets);
        }, 3600000); // Cache for 1 hour
        
        // Simple pagination
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pagedMarkets = allMarkets.slice(start, end);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              total: allMarkets.length,
              page,
              pageSize,
              data: pagedMarkets
            }, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching markets: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Get exchange information
  // 获取交易所信息
  server.tool("get-exchange-info", "Get exchange information and status", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)")
  }, async ({ exchange }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        const ex = getExchange(exchange);
        const cacheKey = `status:${exchange}`;
        
        const info = await getCachedData(cacheKey, async () => {
          log(LogLevel.INFO, `Fetching status information for ${exchange}`);
          return await ex.fetchStatus();
        }, 300000); // Cache for 5 minutes
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(info, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching exchange information: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  log(LogLevel.INFO, "Public API tools registered successfully");
}