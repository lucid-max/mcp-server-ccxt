/**
 * Exchange Manager
 * Manages cryptocurrency exchange instances and provides utility functions
 * 
 * 交易所管理器
 * 管理加密货币交易所实例并提供实用函数
 */
import * as ccxt from 'ccxt';
import { log, LogLevel } from '../utils/logging.js';

// List of supported exchanges
// 支持的交易所列表
export const SUPPORTED_EXCHANGES = [
  'binance', 'coinbase', 'kraken', 'kucoin', 'okx', 
  'gate', 'bybit', 'mexc', 'huobi'
];

// Exchange instance cache
// 交易所实例缓存
const exchanges: Record<string, ccxt.Exchange> = {};

// Default exchange
// 默认交易所
export const DEFAULT_EXCHANGE = process.env.DEFAULT_EXCHANGE || 'binance';

/**
 * Get exchange instance
 * @param exchangeId Exchange ID
 * @returns Exchange instance
 * 
 * 获取交易所实例
 * @param exchangeId 交易所ID
 * @returns 交易所实例
 */
export function getExchange(exchangeId?: string): ccxt.Exchange {
  const id = (exchangeId || DEFAULT_EXCHANGE).toLowerCase();
  
  if (!exchanges[id]) {
    if (!SUPPORTED_EXCHANGES.includes(id)) {
      throw new Error(`Exchange '${id}' not supported`);
    }
    
    const apiKey = process.env[`${id.toUpperCase()}_API_KEY`];
    const secret = process.env[`${id.toUpperCase()}_SECRET`];
    
    try {
      log(LogLevel.INFO, `Initializing exchange: ${id}`);
      // Use indexed access to create exchange instance
      const ExchangeClass = ccxt[id as keyof typeof ccxt];
      exchanges[id] = new (ExchangeClass as any)({
        apiKey,
        secret,
        enableRateLimit: true,
      });
    } catch (error) {
      log(LogLevel.ERROR, `Failed to initialize exchange ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to initialize exchange ${id}: ${error.message}`);
    }
  }
  
  return exchanges[id];
}

/**
 * Get exchange instance with specific credentials
 * @param exchangeId Exchange ID
 * @param apiKey API key
 * @param secret API secret
 * @returns Exchange instance
 * 
 * 使用特定凭据获取交易所实例
 * @param exchangeId 交易所ID
 * @param apiKey API密钥
 * @param secret API密钥秘密
 * @returns 交易所实例
 */
export function getExchangeWithCredentials(
  exchangeId: string,
  apiKey: string,
  secret: string
): ccxt.Exchange {
  try {
    if (!SUPPORTED_EXCHANGES.includes(exchangeId)) {
      throw new Error(`Exchange '${exchangeId}' not supported`);
    }
    
    // Use indexed access to create exchange instance
    const ExchangeClass = ccxt[exchangeId as keyof typeof ccxt];
    return new (ExchangeClass as any)({
      apiKey,
      secret,
      enableRateLimit: true
    });
  } catch (error) {
    log(LogLevel.ERROR, `Failed to initialize exchange ${exchangeId} with credentials: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Failed to initialize exchange ${exchangeId}: ${error.message}`);
  }
}

/**
 * Validate and format trading pair symbol
 * @param symbol Trading pair symbol
 * @returns Formatted trading pair symbol
 * 
 * 验证和格式化交易对符号
 * @param symbol 交易对符号
 * @returns 格式化的交易对符号
 */
export function validateSymbol(symbol: string): string {
  // Simple validation to ensure symbol includes slash
  // 简单验证，确保符号包含斜杠
  if (!symbol.includes('/')) {
    throw new Error(`Invalid symbol: ${symbol}, should be in format like BTC/USDT`);
  }
  return symbol.toUpperCase();
}