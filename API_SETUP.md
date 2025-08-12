# API Setup Guide

## Exchange Rate API Configuration

The Basio Calculator now supports API keys for enhanced exchange rate services. Follow these steps to configure your API keys:

### 1. Create Environment File

Create a `.env.local` file in your project root with the following variables:

```env
# Exchange Rate API Configuration
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key_here
NEXT_PUBLIC_EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD

# Alternative APIs (optional)
NEXT_PUBLIC_FIXER_API_KEY=your_fixer_api_key_here
NEXT_PUBLIC_FIXER_API_URL=http://data.fixer.io/api/latest
```

### 2. Get API Keys

#### Option A: Exchange Rate API (Recommended)
1. Visit [exchangerate-api.com](https://www.exchangerate-api.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to `NEXT_PUBLIC_EXCHANGE_RATE_API_KEY`

#### Option B: Fixer.io (Alternative)
1. Visit [fixer.io](https://fixer.io/)
2. Sign up for an account
3. Get your API key
4. Add it to `NEXT_PUBLIC_FIXER_API_KEY`

### 3. Features with API Keys

**With API Key:**
- ✅ Higher rate limits
- ✅ More accurate rates
- ✅ Additional currency pairs
- ✅ Real-time updates
- ✅ Caching for better performance

**Without API Key (Free Tier):**
- ⚠️ Limited rate limits
- ⚠️ Basic currency support
- ⚠️ Delayed updates
- ✅ Still functional for basic usage

### 4. Service Features

The new exchange rate service includes:

- **Caching**: 5-minute cache to reduce API calls
- **Fallback**: Automatic fallback to free tier if API fails
- **Error Handling**: Graceful degradation on API errors
- **Rate Limiting**: Built-in protection against rate limits
- **Multiple APIs**: Support for multiple exchange rate providers

### 5. Usage

The service automatically:
- Uses your API key if available
- Falls back to free tier if no key is provided
- Caches responses for 5 minutes
- Handles errors gracefully
- Updates rates every 5 minutes

### 6. Security Notes

- API keys are stored in environment variables
- Keys are only used on the client side for exchange rate fetching
- No sensitive data is stored or transmitted
- Free tier is always available as fallback

### 7. Troubleshooting

If you encounter issues:

1. **Check API Key**: Ensure your API key is correct
2. **Rate Limits**: Check if you've exceeded API limits
3. **Network**: Verify internet connection
4. **Cache**: The service will use cached data if API is unavailable
5. **Fallback**: The app will automatically use free tier if needed

### 8. Development

For development, you can:
- Use the free tier without any API keys
- Test with sample API keys
- Monitor API usage in the browser console
- Clear cache using `exchangeRateService.clearCache()`

The exchange rate service is designed to work seamlessly with or without API keys, ensuring the app remains functional in all scenarios.
