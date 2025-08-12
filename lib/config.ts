// API Configuration
export const API_CONFIG = {
  // Exchange Rate API
  EXCHANGE_RATE: {
    API_KEY: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || '',
    BASE_URL: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD',
    FALLBACK_URL: 'https://api.exchangerate-api.com/v4/latest/USD', // Free tier fallback
  },
  
  // Alternative APIs
  FIXER: {
    API_KEY: process.env.NEXT_PUBLIC_FIXER_API_KEY || '',
    BASE_URL: process.env.NEXT_PUBLIC_FIXER_API_URL || 'http://data.fixer.io/api/latest',
  },
  
  // API Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// Exchange Rate Service
export class ExchangeRateService {
  private static instance: ExchangeRateService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService()
    }
    return ExchangeRateService.instance
  }

  private async makeRequest(url: string, headers?: Record<string, string>): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<any> {
    const cacheKey = `rates_${baseCurrency}`
    const cached = this.cache.get(cacheKey)
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Try primary API with API key if available
      if (API_CONFIG.EXCHANGE_RATE.API_KEY) {
        const url = `${API_CONFIG.EXCHANGE_RATE.BASE_URL}?base=${baseCurrency}&apikey=${API_CONFIG.EXCHANGE_RATE.API_KEY}`
        const data = await this.makeRequest(url)
        
        // Cache the successful response
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      } else {
        // Fallback to free API
        const url = `${API_CONFIG.EXCHANGE_RATE.FALLBACK_URL}`
        const data = await this.makeRequest(url)
        
        // Cache the successful response
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log('Using cached exchange rates')
        return cached.data
      }
      
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const exchangeRateService = ExchangeRateService.getInstance()
