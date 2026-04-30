import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../../accounts/entities/account.entity';

@Entity('transaction_lines')
export class TransactionLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.lines)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  credit: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 1.0,
  })
  exchangeRate: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
