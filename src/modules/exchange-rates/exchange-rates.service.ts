/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async create(
    createExchangeRateDto: CreateExchangeRateDto,
  ): Promise<ExchangeRate> {
    // Check if rate already exists for this currency pair and time
    const existing = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrency: createExchangeRateDto.fromCurrency,
        toCurrency: createExchangeRateDto.toCurrency,
        validFrom: new Date(createExchangeRateDto.validFrom),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Exchange rate for ${createExchangeRateDto.fromCurrency}/${createExchangeRateDto.toCurrency} at ${createExchangeRateDto.validFrom} already exists`,
      );
    }

    const exchangeRate = this.exchangeRateRepository.create({
      ...createExchangeRateDto,
      validFrom: new Date(createExchangeRateDto.validFrom),
      validTo: createExchangeRateDto.validTo
        ? new Date(createExchangeRateDto.validTo)
        : null,
    });

    return await this.exchangeRateRepository.save(exchangeRate);
  }

  async getRate(from: string, to: string, date?: Date): Promise<number> {
    // If same currency, rate is 1
    if (from === to) {
      return 1.0;
    }

    const queryDate = date || new Date();

    // Try to find direct rate (USD -> NGN)
    const directRate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrency: from,
        toCurrency: to,
        validFrom: LessThanOrEqual(queryDate),
      },
      order: { validFrom: 'DESC' },
    });

    if (
      directRate &&
      (!directRate.validTo || directRate.validTo >= queryDate)
    ) {
      return Number(directRate.rate);
    }

    // Try reverse rate (NGN -> USD, so we flip it)
    const reverseRate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrency: to,
        toCurrency: from,
        validFrom: LessThanOrEqual(queryDate),
      },
      order: { validFrom: 'DESC' },
    });

    if (
      reverseRate &&
      (!reverseRate.validTo || reverseRate.validTo >= queryDate)
    ) {
      return new Decimal(1).dividedBy(reverseRate.rate).toNumber();
    }

    throw new NotFoundException(`Exchange rate for ${from}/${to} not found`);
  }

  async convert(
    amount: number,
    from: string,
    to: string,
    date?: Date,
  ): Promise<number> {
    const rate = await this.getRate(from, to, date);
    return new Decimal(amount).times(rate).toNumber();
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.find({
      order: { validFrom: 'DESC' },
    });
  }

  async findLatest(from: string, to: string): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrency: from,
        toCurrency: to,
        validTo: IsNull(),
      },
      order: { validFrom: 'DESC' },
    });

    if (!rate) {
      throw new NotFoundException(`No current rate for ${from}/${to}`);
    }

    return rate;
  }

  // Auto-sync rates from external API (runs daily at midnight)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncRatesFromAPI(): Promise<void> {
    console.log('🔄 Syncing exchange rates...');

    try {
      // Example: Fetch from exchangerate-api.com (free tier)
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
      );
      const data = await response.json();

      const baseCurrency = 'USD';
      const validFrom = new Date();

      // Store rates for common currencies
      const currencies = ['NGN', 'EUR', 'GBP', 'JPY', 'CNY'];

      for (const currency of currencies) {
        if (data.rates[currency]) {
          // Check if rate already exists for today
          const existing = await this.exchangeRateRepository.findOne({
            where: {
              fromCurrency: baseCurrency,
              toCurrency: currency,
              validFrom: MoreThanOrEqual(new Date(validFrom.toDateString())),
            },
          });

          if (!existing) {
            await this.create({
              fromCurrency: baseCurrency,
              toCurrency: currency,
              rate: data.rates[currency],
              validFrom: validFrom.toISOString(),
              source: 'api',
            });
            console.log(
              `✅ Synced ${baseCurrency}/${currency}: ${data.rates[currency]}`,
            );
          }
        }
      }

      console.log('✅ Exchange rates synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync exchange rates:', error);
    }
  }
}
