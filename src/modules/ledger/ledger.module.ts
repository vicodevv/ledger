import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { Transaction } from './entities/transaction.entity';
import { TransactionLine } from './entities/transaction-line.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionLine]),
    AccountsModule,
    TenantsModule,
  ],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
