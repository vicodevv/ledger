export class TransactionLineResponseDto {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  currency: string;
  exchangeRate: number;
  description: string;
  createdAt: Date;
}

export class TransactionResponseDto {
  id: string;
  tenantId: string;
  idempotencyKey: string;
  description: string;
  reference: string;
  transactionDate: Date;
  posted: boolean;
  createdBy: string;
  metadata: Record<string, any>;
  lines: TransactionLineResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
