/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionLine } from './entities/transaction-line.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';
import { TenantsService } from '../tenants/tenants.service';
import Decimal from 'decimal.js';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionLine)
    private readonly transactionLineRepository: Repository<TransactionLine>,
    private readonly accountsService: AccountsService,
    private readonly tenantsService: TenantsService,
    private readonly dataSource: DataSource,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // 1. Verify tenant exists
    await this.tenantsService.findOne(createTransactionDto.tenantId);

    // 2. Check idempotency (prevent duplicate transactions)
    if (createTransactionDto.idempotencyKey) {
      const existing = await this.transactionRepository.findOne({
        where: { idempotencyKey: createTransactionDto.idempotencyKey },
        relations: ['lines'],
      });

      if (existing) {
        return existing; // Already processed, return existing transaction
      }
    }

    // 3. Validate all accounts exist and belong to the tenant
    for (const line of createTransactionDto.lines) {
      const account = await this.accountsService.findOne(line.accountId);

      if (account.tenantId !== createTransactionDto.tenantId) {
        throw new BadRequestException(
          `Account ${line.accountId} does not belong to tenant ${createTransactionDto.tenantId}`,
        );
      }

      // Validate that line has either debit OR credit, not both
      if (line.debit > 0 && line.credit > 0) {
        throw new BadRequestException(
          'A transaction line cannot have both debit and credit',
        );
      }

      if (line.debit === 0 && line.credit === 0) {
        throw new BadRequestException(
          'A transaction line must have either debit or credit',
        );
      }
    }

    // 4. Validate double-entry (debits = credits)
    this.validateBalance(createTransactionDto.lines);

    // 5. Create transaction in a database transaction (atomic operation)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create transaction header
      const transaction = this.transactionRepository.create({
        tenantId: createTransactionDto.tenantId,
        idempotencyKey: createTransactionDto.idempotencyKey,
        description: createTransactionDto.description,
        reference: createTransactionDto.reference,
        transactionDate: new Date(createTransactionDto.transactionDate),
        createdBy: createTransactionDto.createdBy,
        metadata: createTransactionDto.metadata,
        posted: true, // Mark as posted immediately
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Create transaction lines
      const lines = createTransactionDto.lines.map((lineDto) => {
        return this.transactionLineRepository.create({
          transactionId: savedTransaction.id,
          accountId: lineDto.accountId,
          debit: lineDto.debit,
          credit: lineDto.credit,
          currency: lineDto.currency,
          exchangeRate: lineDto.exchangeRate || 1.0,
          description: lineDto.description,
        });
      });

      await queryRunner.manager.save(lines);

      // Update account balances
      for (const lineDto of createTransactionDto.lines) {
        const account = await this.accountsService.findOne(lineDto.accountId);

        // Calculate balance change based on account type
        let balanceChange = new Decimal(lineDto.debit)
          .minus(lineDto.credit)
          .toNumber();

        // For LIABILITY, EQUITY, and REVENUE accounts, credits increase balance
        if (['LIABILITY', 'EQUITY', 'REVENUE'].includes(account.type)) {
          balanceChange = -balanceChange;
        }

        await queryRunner.manager.update(
          'accounts',
          { id: lineDto.accountId },
          { balance: () => `balance + ${balanceChange}` },
        );
      }

      await queryRunner.commitTransaction();

      // Return transaction with lines
      return await this.transactionRepository.findOne({
        where: { id: savedTransaction.id },
        relations: ['lines'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateBalance(lines: any[]): void {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of lines) {
      totalDebit = totalDebit.plus(line.debit);
      totalCredit = totalCredit.plus(line.credit);
    }

    // Allow tiny floating point difference (0.0001)
    const difference = totalDebit.minus(totalCredit).abs();

    if (difference.greaterThan(0.0001)) {
      throw new BadRequestException(
        `Transaction not balanced: debits (${totalDebit}) != credits (${totalCredit})`,
      );
    }
  }

  async findAll(tenantId?: string): Promise<Transaction[]> {
    const where = tenantId ? { tenantId } : {};
    return await this.transactionRepository.find({
      where,
      relations: ['lines'],
      order: { transactionDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['lines'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID '${id}' not found`);
    }

    return transaction;
  }
}
