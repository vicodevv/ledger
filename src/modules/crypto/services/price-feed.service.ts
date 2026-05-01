import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
  };
}

@Injectable()
export class PriceFeedService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private priceCache: Map<string, { price: number; timestamp: number }> =
    new Map();
  private readonly cacheDuration = 60000; // 1 minute

  async getPrice(symbol: string): Promise<number> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    const coinId = this.getCoinGeckoId(symbol);
    const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`;

    try {
      const response = await axios.get<CoinGeckoPrice>(url);
      const price = response.data[coinId]?.usd || 0;

      this.priceCache.set(symbol, { price, timestamp: Date.now() });

      return price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return 0;
    }
  }

  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    for (const symbol of symbols) {
      prices[symbol] = await this.getPrice(symbol);
    }

    return prices;
  }

  async convertToUsd(amount: number, symbol: string): Promise<number> {
    const price = await this.getPrice(symbol);
    return amount * price;
  }

  private getCoinGeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDC: 'usd-coin',
      USDT: 'tether',
      MATIC: 'matic-network',
      DAI: 'dai',
      WETH: 'weth',
      WBTC: 'wrapped-bitcoin',
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }
}
