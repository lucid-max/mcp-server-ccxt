# Changelog

## v1.2.0 (2025-03-31)

### Added Proxy Support
- 添加了 getProxyConfig 和 formatProxyUrl 函数配置和使用代理
- 添加了配置工具控制代理设置（set-proxy-config, test-proxy-connection）
- 添加了 clearExchangeCache 函数清理交易所缓存
- 添加了控制台输出重定向到stderr避免干扰MCP协议
- 创建了 fix-mcp-errors.sh 脚本处理MCP通信问题

### Expanded Exchange Support
- 增加了更多交易所支持 (bitget, coinex, cryptocom 等)
- 添加了现有交易所的衍生品市场支持 (binanceusdm, kucoinfutures 等)
- 添加了市场类型支持（MarketType枚举：spot, future, swap, option, margin）
- 添加了DEFAULT_MARKET_TYPE全局设置
- 修改了getExchange函数支持不同市场类型
- 添加了getExchangeWithMarketType函数获取特定市场类型的交易所

### Enhanced Tools
- 添加了期货交易工具（set-leverage, set-margin-mode）
- 添加了期货市场数据工具（get-leverage-tiers, get-funding-rates）
- 添加了期货交易工具（place-futures-market-order）
- 更新了现有交易工具支持市场类型参数
- 添加了配置工具修改运行时设置（set-market-type）

### Improved Utilities
- 优化了缓存系统（支持市场类型区分）
- 添加了不同级别的日志功能（DEBUG, INFO, WARNING, ERROR）
- 改进了自适应速率限制器处理API限制
- 添加了根据交易所API限制动态调整请求频率

### Other Changes
- 更新了package.json版本至1.2.0
- 添加了rxjs依赖项
- 更新了相关文档和示例
