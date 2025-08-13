# Base Network API Integration Guide

## Overview

Your DailyBase application now includes real Base network API integration that fetches live data from various blockchain data sources. This replaces the mock data with actual network metrics, gas prices, and token information.

## Features

✅ **Real Gas Prices**: Live gas prices from Base network RPC  
✅ **Token Price Data**: Base token price and market cap from CoinGecko  
✅ **Network Statistics**: Transaction counts, block heights, and more  
✅ **User Activity Analytics**: Personal activity metrics based on your entries  
✅ **Caching System**: 5-minute cache to reduce API calls  
✅ **Fallback Data**: Graceful degradation when APIs are unavailable  
✅ **Rate Limiting**: Built-in protection against API rate limits  

## API Sources

### 1. Base Network RPC
- **Endpoint**: `https://mainnet.base.org`
- **Purpose**: Gas prices, block information
- **Method**: JSON-RPC calls
- **Rate Limit**: No key required, public endpoint

### 2. CoinGecko API
- **Endpoint**: `https://api.coingecko.com/api/v3`
- **Purpose**: Base token price and market cap
- **Method**: REST API
- **Rate Limit**: 50 calls/minute (free tier)

### 3. BaseScan API (Optional)
- **Endpoint**: `https://api.basescan.org/api`
- **Purpose**: Enhanced network statistics
- **Method**: REST API
- **Rate Limit**: Requires API key for higher limits

## Setup Instructions

### 1. Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Base Network API Configuration
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
```

### 2. Getting API Keys

#### BaseScan API Key (Optional but Recommended)
1. Visit [BaseScan](https://basescan.org/)
2. Create an account
3. Go to API section
4. Generate a new API key
5. Add to `NEXT_PUBLIC_BASESCAN_API_KEY`

#### Alchemy API Key (Optional)
1. Visit [Alchemy](https://www.alchemy.com/)
2. Create an account
3. Create a new app for Base network
4. Copy the API key
5. Add to `NEXT_PUBLIC_ALCHEMY_API_KEY`

#### Infura API Key (Optional)
1. Visit [Infura](https://infura.io/)
2. Create an account
3. Create a new project
4. Add Base network to your project
5. Copy the API key
6. Add to `NEXT_PUBLIC_INFURA_API_KEY`

## API Endpoints

### Base Network Data
```typescript
// Get comprehensive network data
const networkData = await baseNetworkAPI.getBaseNetworkData()

// Returns:
{
  totalTransactions: number
  dailyTransactions: number
  totalUsers: number
  activeUsers: number
  totalVolume: number
  gasPrice: number
  blockHeight: number
  tvl: number
  price: number
  marketCap: number
  lastUpdated: string
}
```

### Gas Price
```typescript
// Get current gas price in Gwei
const gasPrice = await baseNetworkAPI.getGasPrice()
```

### Token Price
```typescript
// Get Base token price and market cap
const priceData = await baseNetworkAPI.getBasePrice()

// Returns:
{
  price: number,      // USD price
  marketCap: number   // Market capitalization
}
```

### User Activity
```typescript
// Calculate user activity from local entries
const userActivity = baseNetworkAPI.calculateUserActivity(entries)

// Returns:
{
  totalEntries: number
  weeklyEntries: number
  monthlyEntries: number
  averageEntriesPerDay: number
  mostActiveDay: string
  totalGasSpent: number
  favoriteTags: string[]
  lastActivity: string
}
```

## Dashboard Integration

The Base network data is automatically integrated into your dashboard:

### Network Overview Cards
- **Total Transactions**: Live transaction count
- **Daily Transactions**: Today's transaction volume
- **Active Users**: Estimated active addresses
- **Gas Price**: Current gas price in Gwei

### Network Statistics
- **Block Height**: Latest block number
- **Total Volume**: Network transaction volume
- **TVL**: Total Value Locked in DeFi protocols
- **Market Cap**: Base token market capitalization

### User Activity
- **Personal Metrics**: Your entry statistics
- **Activity Patterns**: Most active days and tags
- **Gas Usage**: Estimated gas spent on activities

## Error Handling

The API includes comprehensive error handling:

### Fallback Strategy
1. **Primary**: Real API data
2. **Secondary**: Cached data (5 minutes)
3. **Tertiary**: Mock data with realistic ranges

### Error Types
- **Network Errors**: Automatic retry with exponential backoff
- **Rate Limits**: Automatic throttling and queuing
- **API Failures**: Graceful degradation to fallback data

## Performance Optimization

### Caching
- **Duration**: 5 minutes per API call
- **Storage**: In-memory cache with size limits
- **Invalidation**: Automatic cleanup of expired entries

### Rate Limiting
- **Requests per minute**: 60 (configurable)
- **Requests per hour**: 1000 (configurable)
- **Queue system**: Automatic request queuing

### Data Fetching
- **Parallel requests**: Multiple APIs called simultaneously
- **Timeout handling**: 10-second timeout per request
- **Retry logic**: 3 attempts with exponential backoff

## Monitoring and Debugging

### Console Logs
The API logs detailed information to the browser console:
- API call attempts
- Success/failure status
- Response times
- Error details

### Network Tab
Monitor API calls in browser DevTools:
- Request/response headers
- Response times
- Error status codes

### Error Tracking
```typescript
// Check for API errors
console.error('Base API Error:', error)

// Monitor cache hits/misses
console.log('Cache status:', cacheStatus)
```

## Troubleshooting

### Common Issues

#### 1. API Rate Limits
**Symptoms**: 429 errors, slow responses
**Solution**: 
- Add API keys for higher limits
- Implement longer cache durations
- Reduce request frequency

#### 2. Network Timeouts
**Symptoms**: Requests hanging, fallback data showing
**Solution**:
- Check internet connection
- Verify API endpoints are accessible
- Increase timeout values

#### 3. CORS Errors
**Symptoms**: Blocked requests in browser
**Solution**:
- Use server-side API calls
- Configure CORS headers
- Use proxy endpoints

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('base-api-debug', 'true')
```

This will show detailed API call information in the console.

## Future Enhancements

### Planned Features
- **Historical Data**: 7-day, 30-day, 1-year charts
- **Real-time Updates**: WebSocket connections for live data
- **Custom Metrics**: User-defined network statistics
- **Export Functionality**: Download network data as CSV/JSON

### API Expansions
- **DeFi Protocols**: TVL data from specific protocols
- **NFT Statistics**: Base NFT market data
- **Bridge Activity**: Cross-chain bridge statistics
- **Developer Activity**: Contract deployments and interactions

## Security Considerations

### API Key Management
- Store keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Use least-privilege access

### Rate Limiting
- Implement client-side rate limiting
- Monitor API usage
- Set up alerts for excessive usage
- Use caching to reduce API calls

### Data Validation
- Validate all API responses
- Sanitize data before display
- Handle malformed responses gracefully
- Log suspicious activity

## Support

For issues with the Base network API integration:

1. **Check Console**: Look for error messages in browser console
2. **Verify API Keys**: Ensure all API keys are valid and active
3. **Test Endpoints**: Use browser or Postman to test API endpoints
4. **Check Rate Limits**: Monitor API usage and limits
5. **Review Logs**: Check application logs for detailed error information

## API Documentation Links

- [Base Network RPC](https://docs.base.org/)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [BaseScan API](https://basescan.org/apis)
- [DeFiLlama API](https://docs.llama.fi/)
