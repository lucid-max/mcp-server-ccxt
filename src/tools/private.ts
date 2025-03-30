/**
 * Private API Tools
 * Tools for accessing private cryptocurrency exchange functionality
 * 
 * 私有API工具
 * 用于访问私有加密货币交易所功能的工具
 */
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getExchangeWithCredentials } from '../exchange/manager.js';
import { log, LogLevel } from '../utils/logging.js';
import { rateLimiter } from '../utils/rate-limiter.js';

export function registerPrivateTools(server: McpServer) {
  // Account balance
  // 账户余额
  server.tool("account-balance", "Get your account balance from a crypto exchange", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    apiKey: z.string().describe("API key for authentication"),
    secret: z.string().describe("API secret for authentication")
  }, async ({ exchange, apiKey, secret }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        // Get exchange
        const ex = getExchangeWithCredentials(exchange, apiKey, secret);
        
        // Fetch balance
        log(LogLevel.INFO, `Fetching account balance for ${exchange}`);
        const balance = await ex.fetchBalance();
        
        // Format the balance for better readability
        const formattedBalance = {
          total: balance.total,
          free: balance.free,
          used: balance.used,
          timestamp: new Date(balance.timestamp || Date.now()).toISOString()
        };
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(formattedBalance, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error fetching account balance: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error fetching account balance: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  // Place market order
  // 下市价单
  server.tool("place-market-order", "Place a market order on an exchange", {
    exchange: z.string().describe("Exchange ID (e.g., binance, coinbase)"),
    symbol: z.string().describe("Trading pair symbol (e.g., BTC/USDT)"),
    side: z.enum(['buy', 'sell']).describe("Order side: buy or sell"),
    amount: z.number().positive().describe("Amount to buy/sell"),
    apiKey: z.string().describe("API key for authentication"),
    secret: z.string().describe("API secret for authentication")
  }, async ({ exchange, symbol, side, amount, apiKey, secret }) => {
    try {
      return await rateLimiter.execute(exchange, async () => {
        // Get exchange
        const ex = getExchangeWithCredentials(exchange, apiKey, secret);
        
        // Place market order
        log(LogLevel.INFO, `Placing ${side} market order for ${symbol} on ${exchange}, amount: ${amount}`);
        const order = await ex.createOrder(symbol, 'market', side, amount);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(order, null, 2)
          }]
        };
      });
    } catch (error) {
      log(LogLevel.ERROR, `Error placing market order: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [{
          type: "text",
          text: `Error placing market order: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });

  log(LogLevel.INFO, "Private API tools registered successfully");
}