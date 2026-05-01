import { BlockchainNetwork } from '../entities/crypto-wallet.entity';

export class CryptoWalletResponseDto {
  id: string;
  tenantId: string;
  address: string;
  network: BlockchainNetwork;
  label: string;
  isActive: boolean;
  lastSyncedAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
