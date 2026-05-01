import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { CryptoWallet } from './entities/crypto-wallet.entity';
import { CryptoTransaction } from './entities/crypto-transaction.entity';
import { BlockchainProviderService } from './services/blockchain-provider.service';
import { PriceFeedService } from './services/price-feed.service';
import { LedgerModule } from '../ledger/ledger.module';
import { AccountsModule } from '../accounts/accounts.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoWallet, CryptoTransaction]),
    LedgerModule,
    AccountsModule,
    AuditModule,
  ],
  controllers: [CryptoController],
  providers: [CryptoService, BlockchainProviderService, PriceFeedService],
  exports: [CryptoService],
})
export class CryptoModule {}
