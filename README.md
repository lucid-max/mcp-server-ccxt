# CCXT MCP Server

CCXT MCP Server is a high-performance cryptocurrency exchange integration server built on the Model Context Protocol (MCP). It enables language models and other MCP clients to interact with cryptocurrency exchanges in a standardized, efficient way.

![CCXT MCP Server Integration Architecture](docs/images/mcp-integration.svg)

## Features

- **High Performance**: Optimized caching system and adaptive rate limiting for maximum throughput
- **Multi-Exchange Support**: Connect to 9+ major cryptocurrency exchanges through a unified API
- **Comprehensive APIs**: Access market data, trading capabilities, and account information
- **LLM Integration**: Designed specifically for use with language models via MCP

## Code Architecture

The server is organized into three main modules for better maintainability and extensibility:

![CCXT MCP Server Code Architecture](docs/images/code-architecture.svg)

- **Exchange**: Manages exchange instances, credentials, and symbol validation
- **Utils**: Provides caching, rate limiting, and logging functionality
- **Tools**: Implements MCP tools and resources for exchange interaction

## Supported Exchanges

- Binance
- Coinbase
- Kraken
- KuCoin
- OKX
- Gate.io
- Bybit
- MEXC
- HTX (Huobi)

## Installation

```bash
# Clone the repository
git clone https://github.com/shuhaozhang95/mcp-server-ccxt.git
cd mcp-server-ccxt

# Install dependencies
npm install

# Build the server
npm run build
```

## Configuration

1. Create an environment file
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to add your exchange API keys
   ```
   BINANCE_API_KEY=your_api_key
   BINANCE_SECRET=your_secret
   
   COINBASE_API_KEY=your_api_key
   COINBASE_SECRET=your_secret
   
   # Add more exchange keys as needed
   ```

3. Set the default exchange (optional)
   ```
   DEFAULT_EXCHANGE=binance
   ```

## Usage

> **Note**: If you encounter any issues with MCP communication, please see the [Troubleshooting Guide](docs/troubleshooting.md) for solutions.

### Running the Server

Start the server:

```bash
npm start
```

### Using with Claude for Desktop

1. Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ccxt": {
      "command": "node",
      "args": [
        "/path/to/mcp-server-ccxt/build/index.js"
      ]
    }
  }
}
```

2. Restart Claude for Desktop

### Example Queries

Here are some example queries you can use with the MCP server:

- "What's the current price of Bitcoin on Binance?"
- "Show me the order book for ETH/USDT on Coinbase"
- "Get the 1-hour OHLCV data for BTC/USDT on Binance for the last 24 candles"
- "Compare the price of SOL/USDT across different exchanges"
- "What's my current balance on Binance?" (requires API keys)
- "Place a market buy order for 0.1 ETH on Kraken" (requires API keys)

## Available Tools

### Public API Tools

- `list-exchanges`: List all available cryptocurrency exchanges
- `get-ticker`: Get current ticker information for a trading pair
- `batch-get-tickers`: Get ticker information for multiple trading pairs at once
- `get-orderbook`: Get market order book for a trading pair
- `get-ohlcv`: Get OHLCV candlestick data for a trading pair
- `get-trades`: Get recent trades for a trading pair
- `get-markets`: Get all available markets for an exchange
- `get-exchange-info`: Get exchange information and status

### Private API Tools (requires API keys)

- `account-balance`: Get your account balance from a crypto exchange
- `place-market-order`: Place a market order on an exchange

### Utility Tools

- `cache-stats`: Get CCXT cache statistics
- `clear-cache`: Clear CCXT cache
- `set-log-level`: Set logging level

## Available Resources

- `ccxt://exchanges`: List of supported exchanges
- `ccxt://{exchange}/markets`: Available markets on a specific exchange
- `ccxt://{exchange}/ticker/{symbol}`: Ticker information for a specific trading pair
- `ccxt://{exchange}/orderbook/{symbol}`: Order book for a specific trading pair

## Performance Optimizations

MCP-CCXT includes several optimizations to ensure high performance:

1. **LRU Caching System**:
   - Different TTLs for different types of data
   - Ticker data: 10 seconds
   - Order book data: 5 seconds
   - Market data: 1 hour

2. **Adaptive Rate Limiting**:
   - Automatically adjusts request rates based on exchange responses
   - Implements exponential backoff for errors
   - Manages concurrent requests per exchange

3. **Exchange Connection Management**:
   - Efficient initialization of exchange instances
   - Proper error handling and retries

## Security Best Practices

### API Key Security

1. **Create Dedicated API Keys**:
   - Create separate API keys for different applications/purposes
   - Never reuse API keys across different services or applications

2. **Limit API Key Permissions**:
   - Enable only the permissions you need (e.g., read-only for market data)
   - Disable withdrawal permissions if you only need trading functionality
   - Use IP whitelisting when available to restrict access to known IPs

3. **Secure Storage**:
   - Never commit API keys to version control systems
   - Store API keys in environment variables or a secure vault
   - Use `.env` files that are excluded from git via `.gitignore`

### System Security

1. **Server Hardening**:
   - Keep your system and dependencies updated
   - Run the server on a dedicated machine with limited access
   - Use a firewall to restrict inbound/outbound connections

2. **Transport Security**:
   - Use HTTPS for all communications
   - Implement proper TLS certificate validation

3. **Monitoring and Logging**:
   - Monitor for unusual activity or unauthorized access
   - Implement logging for all trading activities
   - Set up alerts for unexpected behavior

### Trading Safety

1. **Test First**:
   - Start with small amounts to test functionality
   - Use testnet environments when available

2. **Implement Safeguards**:
   - Set reasonable position size limits
   - Implement circuit breakers for volatile conditions
   - Consider setting stop-loss orders for open positions

3. **Regular Audits**:
   - Periodically review trading activity
   - Validate account balances against expected values
   - Revoke and rotate API keys periodically

### Emergency Procedures

1. **Have a Kill Switch**:
   - Know how to immediately revoke API keys if needed
   - Document the process for quickly shutting down trading operations

2. **Backup Plans**:
   - Maintain backup API keys (inactive until needed)
   - Document recovery procedures for various failure scenarios

## Risk Disclaimer

This software is provided for informational purposes only. Using this software to interact with cryptocurrency exchanges involves significant risks:

- **Financial Risk**: Cryptocurrency trading involves risk of loss
- **API Security**: Ensure your API keys have appropriate permission limits
- **No Investment Advice**: This tool does not provide investment advice
- **No Warranty**: The software is provided "as is" without warranty of any kind

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

---

For issues, feature requests, or contributions, please visit [the GitHub repository](https://github.com/shuhaozhang95/mcp-server-ccxt).