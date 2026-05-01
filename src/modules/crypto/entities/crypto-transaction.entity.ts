import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CryptoWallet } from './crypto-wallet.entity';

export enum CryptoTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
}

export enum CryptoTransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

@Entity('crypto_transactions')
@Index(['walletId', 'blockNumber'])
@Index(['txHash'], { unique: true })
export class CryptoTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => CryptoWallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: CryptoWallet;

  @Column({ name: 'tx_hash', type: 'varchar', length: 255 })
  txHash: string; // On-chain transaction hash

  @Column({ name: 'from_address', type: 'varchar', length: 255 })
  fromAddress: string;

  @Column({ name: 'to_address', type: 'varchar', length: 255 })
  toAddress: string;

  @Column({ type: 'varchar', length: 10 })
  asset: string; // BTC, ETH, USDC, etc.

  @Column({ type: 'decimal', precision: 30, scale: 18 })
  amount: number; // Crypto amount (high precision for decimals)

  @Column({
    name: 'amount_usd',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
  })
  amountUsd: number; // USD value at time of transaction

  @Column({
    type: 'enum',
    enum: CryptoTransactionType,
  })
  type: CryptoTransactionType;

  @Column({
    type: 'enum',
    enum: CryptoTransactionStatus,
    default: CryptoTransactionStatus.PENDING,
  })
  status: CryptoTransactionStatus;

  @Column({ name: 'block_number', type: 'bigint', nullable: true })
  blockNumber: number;

  @Column({ name: 'block_timestamp', type: 'timestamp', nullable: true })
  blockTimestamp: Date;

  @Column({
    name: 'gas_used',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: true,
  })
  gasUsed: number;

  @Column({
    name: 'gas_price',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: true,
  })
  gasPrice: number;

  @Column({ name: 'confirmations', type: 'int', default: 0 })
  confirmations: number;

  @Column({ name: 'ledger_transaction_id', nullable: true })
  ledgerTransactionId: string; // Link to the ledger transaction

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
