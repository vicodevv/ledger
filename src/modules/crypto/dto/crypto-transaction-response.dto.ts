import {
  CryptoTransactionType,
  CryptoTransactionStatus,
} from '../entities/crypto-transaction.entity';

export class CryptoTransactionResponseDto {
  id: string;
  walletId: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: number;
  amountUsd: number;
  type: CryptoTransactionType;
  status: CryptoTransactionStatus;
  blockNumber: number;
  blockTimestamp: Date;
  gasUsed: number;
  gasPrice: number;
  confirmations: number;
  ledgerTransactionId: string;
  createdAt: Date;
}
