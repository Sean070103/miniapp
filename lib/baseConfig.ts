// Base Network Configuration
export const BASE_CONFIG = {
  // Base Network RPC Endpoints
  RPC: {
    MAINNET: 'https://mainnet.base.org',
    TESTNET: 'https://goerli.base.org',
    DEFAULT: 'https://mainnet.base.org'
  },

  // BaseScan API Configuration
  BASESCAN: {
    API_KEY: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
    BASE_URL: 'https://api.basescan.org/api',
    ENDPOINTS: {
      STATS: '/stats',
      BLOCKS: '/blocks',
      TRANSACTIONS: '/transactions',
      ACCOUNTS: '/accounts'
    }
  },

  // CoinGecko API for Base token data
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    ENDPOINTS: {
      PRICE: '/simple/price',
      MARKET_DATA: '/coins/base',
      MARKET_CHART: '/coins/base/market_chart'
    }
  },

  // DeFiLlama API for TVL data
  DEFILLAMA: {
    BASE_URL: 'https://api.llama.fi',
    ENDPOINTS: {
      PROTOCOL: '/protocol/base',
      TVL: '/tvl/base'
    }
  },

  // API Headers
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'DailyBase/1.0'
  },

  // Cache Settings
  CACHE: {
    DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100
  },

  // Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000
  }
}

// Environment Variables Documentation
export const ENV_VARS = {
  NEXT_PUBLIC_BASESCAN_API_KEY: 'BaseScan API key for enhanced data access',
  NEXT_PUBLIC_ALCHEMY_API_KEY: 'Alchemy API key for RPC access',
  NEXT_PUBLIC_INFURA_API_KEY: 'Infura API key for RPC access'
}

// Base Network Constants
export const BASE_CONSTANTS = {
  CHAIN_ID: 8453,
  CHAIN_NAME: 'Base',
  NATIVE_CURRENCY: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  BLOCK_TIME: 2, // seconds
  EXPLORER_URL: 'https://basescan.org',
  BRIDGE_URL: 'https://bridge.base.org'
}
