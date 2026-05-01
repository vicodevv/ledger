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
import { CryptoService } from './crypto.service';
import { CreateCryptoWalletDto } from './dto/create-crypto-wallet.dto';
import { CryptoWalletResponseDto } from './dto/crypto-wallet-response.dto';
import { CryptoTransactionResponseDto } from './dto/crypto-transaction-response.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('wallets')
  @HttpCode(HttpStatus.CREATED)
  async createWallet(
    @Body() createWalletDto: CreateCryptoWalletDto,
  ): Promise<CryptoWalletResponseDto> {
    return await this.cryptoService.createWallet(createWalletDto);
  }

  @Get('wallets')
  async findAllWallets(
    @Query('tenantId') tenantId?: string,
  ): Promise<CryptoWalletResponseDto[]> {
    return await this.cryptoService.findAllWallets(tenantId);
  }

  @Get('wallets/:id')
  async findWallet(@Param('id') id: string): Promise<CryptoWalletResponseDto> {
    return await this.cryptoService.findWallet(id);
  }

  @Get('wallets/:id/balance')
  async getBalance(
    @Param('id') id: string,
    @Query('asset') asset?: string,
  ): Promise<{ balance: string; usdValue: number }> {
    return await this.cryptoService.getBalance(id, asset || 'ETH');
  }

  @Get('wallets/:id/balances')
  async getAllBalances(@Param('id') id: string): Promise<any[]> {
    return await this.cryptoService.getAllBalances(id);
  }

  @Get('wallets/:id/transactions')
  async getTransactions(
    @Param('id') id: string,
  ): Promise<CryptoTransactionResponseDto[]> {
    return await this.cryptoService.findTransactions(id);
  }

  @Post('wallets/:id/sync')
  @HttpCode(HttpStatus.OK)
  async syncWallet(@Param('id') id: string): Promise<{ message: string }> {
    await this.cryptoService.syncWalletTransactions(id);
    return { message: 'Wallet sync initiated' };
  }

  @Post('deposits')
  @HttpCode(HttpStatus.CREATED)
  async recordDeposit(
    @Body()
    body: {
      walletId: string;
      txHash: string;
      asset: string;
      amount: number;
    },
  ): Promise<CryptoTransactionResponseDto> {
    return await this.cryptoService.recordDeposit(
      body.walletId,
      body.txHash,
      body.asset,
      body.amount,
    );
  }
}
