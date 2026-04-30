import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createExchangeRateDto: CreateExchangeRateDto,
  ): Promise<ExchangeRateResponseDto> {
    return await this.exchangeRatesService.create(createExchangeRateDto);
  }

  @Get()
  async findAll(): Promise<ExchangeRateResponseDto[]> {
    return await this.exchangeRatesService.findAll();
  }

  @Get('latest')
  async findLatest(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<ExchangeRateResponseDto> {
    return await this.exchangeRatesService.findLatest(from, to);
  }

  @Get('rate')
  async getRate(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date?: string,
  ): Promise<{ rate: number }> {
    const queryDate = date ? new Date(date) : undefined;
    const rate = await this.exchangeRatesService.getRate(from, to, queryDate);
    return { rate };
  }

  @Get('convert')
  async convert(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date?: string,
  ): Promise<{ amount: number; convertedAmount: number; rate: number }> {
    const queryDate = date ? new Date(date) : undefined;
    const convertedAmount = await this.exchangeRatesService.convert(
      amount,
      from,
      to,
      queryDate,
    );
    const rate = await this.exchangeRatesService.getRate(from, to, queryDate);

    return {
      amount: Number(amount),
      convertedAmount,
      rate,
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncRates(): Promise<{ message: string }> {
    await this.exchangeRatesService.syncRatesFromAPI();
    return { message: 'Exchange rates sync initiated' };
  }
}
