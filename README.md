
# CCXT MCP Server

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
[![MCP Standard](https://img.shields.io/badge/MCP-Standard-green.svg)](https://www.modelcontextprotocol.org/)
[![CCXT](https://img.shields.io/badge/CCXT-4.0.0-orange.svg)](https://github.com/ccxt/ccxt)

High-performance cryptocurrency exchange integration using MCP (Model Context Protocol) and CCXT.

## Features

- 🚀 **Exchange Support**: Connects to 20+ cryptocurrency exchanges
- 🔃 **Market Types**: Supports spot, futures, swap markets and more
- 🔧 **Proxy Configuration**: Options for accessing exchanges through proxies
- 📊 **Fast & Reliable**: Optimized caching and rate limiting
- 🌐 **MCP Standard**: Compatible with LLMs like Claude and GPT via MCP

## Quick Start

### Installation

```
npm install @mcpfun/mcp-server-ccxt
```

Or run directly:

```
npx @mcpfun/mcp-server-ccxt
```

### Environment Setup

Create a `.env` file:

```
# Default exchange (optional)
DEFAULT_EXCHANGE=binance

# Default market type (optional)
DEFAULT_MARKET_TYPE=spot 

# API credentials (optional)
BINANCE_API_KEY=your_api_key
BINANCE_SECRET=your_api_secret

# Proxy configuration (optional)
USE_PROXY=false
PROXY_URL=http://your-proxy-server:port
PROXY_USERNAME=
PROXY_PASSWORD=
```

### Usage

Start the MCP server:

```
npm start
```

Connect using any MCP client such as:
- Claude via Anthropic's MCP API
- GPT via OpenAI's function calling tools
- Any other MCP-compatible client

## Available Tools

### Public API Tools
- `get-ticker`: Get current ticker information
- `get-order-book`: Get order book data
- `get-leverage-tiers`: Get futures leverage tiers
- `get-funding-rates`: Get current funding rates

### Private API Tools
- `account-balance`: Get account balance
- `place-market-order`: Place market orders
- `set-leverage`: Set leverage for futures
- `set-margin-mode`: Set margin mode for futures
- `place-futures-market-order`: Place futures orders

### Configuration Tools
- `get-proxy-config`: Get proxy settings
- `set-proxy-config`: Configure proxy settings
- `set-market-type`: Set default market type

## MCP Communication Fixes

If you encounter issues with MCP protocol communication, run:

```
./fix-mcp-errors.sh
```

## License

MIT
