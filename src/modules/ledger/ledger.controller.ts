import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Controller('transactions')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return await this.ledgerService.createTransaction(createTransactionDto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
  ): Promise<TransactionResponseDto[]> {
    return await this.ledgerService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return await this.ledgerService.findOne(id);
  }
}
