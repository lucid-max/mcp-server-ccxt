/**
 * Cache System
 * Provides high-performance caching with LRU (Least Recently Used) strategy
 * 
 * 缓存系统
 * 提供基于LRU（最近最少使用）策略的高性能缓存
 */
import { LRUCache } from 'lru-cache';
import { log, LogLevel } from './logging.js';

// Cache TTL settings for different data types (in milliseconds)
// 不同数据类型的缓存TTL设置（毫秒）
const CACHE_TTL = {
  ticker: 10 * 1000,       // Ticker data: 10 seconds
  orderbook: 5 * 1000,     // Order book: 5 seconds
  markets: 60 * 60 * 1000, // Markets data: 1 hour
  ohlcv: 60 * 1000,        // OHLCV data: 1 minute
  trades: 30 * 1000,       // Recent trades: 30 seconds
  status: 5 * 60 * 1000,   // Exchange status: 5 minutes
};

// Cache statistics
// 缓存统计
export const cacheStats = {
  hits: 0,
  misses: 0,
  size: 0,
  lastCleared: new Date().toISOString()
};

// Create high-performance LRU cache
// 创建高性能LRU缓存
const dataCache = new LRUCache({
  max: 1000,              // Max cache items: 1000
  ttl: 30 * 1000,         // Default TTL: 30 seconds
  updateAgeOnGet: true,   // Update item age on access
  allowStale: false,      // Don't return stale items
});

/**
 * Determine TTL based on key pattern
 * @param key Cache key
 * @returns TTL in milliseconds
 * 
 * 根据键模式确定TTL
 * @param key 缓存键
 * @returns TTL（毫秒）
 */
function getTtl(key: string): number {
  if (key.startsWith('ticker:')) return CACHE_TTL.ticker;
  if (key.startsWith('orderbook:')) return CACHE_TTL.orderbook;
  if (key.startsWith('markets:')) return CACHE_TTL.markets;
  if (key.startsWith('ohlcv:')) return CACHE_TTL.ohlcv;
  if (key.startsWith('trades:')) return CACHE_TTL.trades;
  if (key.startsWith('status:')) return CACHE_TTL.status;
  return 30 * 1000; // Default: 30 seconds
}

/**
 * Get data from cache or fetch using provided function
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param customTtl Optional custom TTL in milliseconds
 * @returns Cached data or newly fetched data
 * 
 * 从缓存获取数据或使用提供的函数获取
 * @param key 缓存键
 * @param fetchFn 如果缓存中没有数据，用于获取数据的函数
 * @param customTtl 可选的自定义TTL（毫秒）
 * @returns 缓存数据或新获取的数据
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  customTtl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = dataCache.get(key) as T;
  if (cached) {
    log(LogLevel.DEBUG, `Cache hit: ${key}`);
    cacheStats.hits++;
    return cached;
  }

  // Cache miss, fetch data
  log(LogLevel.DEBUG, `Cache miss: ${key}, fetching data`);
  cacheStats.misses++;
  
  try {
    const data = await fetchFn();
    const ttl = customTtl || getTtl(key);
    dataCache.set(key, data as any, { ttl });
    cacheStats.size = dataCache.size;
    return data;
  } catch (error) {
    log(LogLevel.ERROR, `Error fetching data for key ${key}: ${error}`);
    throw error;
  }
}

/**
 * Clear cache
 * @param keyPattern Optional key pattern to clear specific keys
 * 
 * 清除缓存
 * @param keyPattern 可选的键模式，用于清除特定模式的键
 */
export function clearCache(keyPattern?: string): void {
  if (keyPattern) {
    // Clear all keys matching specific pattern
    const keys = [];
    for (const key of dataCache.keys()) {
      if (typeof key === 'string' && key.includes(keyPattern)) {
        keys.push(key);
      }
    }
    
    // Delete all matching keys from cache
    keys.forEach(key => dataCache.delete(key));
    log(LogLevel.INFO, `Cleared ${keys.length} cache items matching "${keyPattern}"`);
  } else {
    // Clear entire cache
    const size = dataCache.size;
    dataCache.clear();
    log(LogLevel.INFO, `Cleared all ${size} cache items`);
  }
  
  // Update cache statistics
  cacheStats.size = dataCache.size;
  cacheStats.lastCleared = new Date().toISOString();
  cacheStats.hits = 0;
  cacheStats.misses = 0;
}

/**
 * Get cache statistics
 * @returns Cache statistics object
 * 
 * 获取缓存统计信息
 * @returns 缓存统计对象
 */
export function getCacheStats() {
  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRatio: cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses)).toFixed(2) 
      : '0.00',
    size: dataCache.size,
    maxSize: dataCache.max,
    lastCleared: cacheStats.lastCleared
  };
}