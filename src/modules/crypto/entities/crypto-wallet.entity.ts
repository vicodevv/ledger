import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BlockchainNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BITCOIN = 'BITCOIN',
  BASE = 'BASE',
  ARBITRUM = 'ARBITRUM',
}

@Entity('crypto_wallets')
@Index(['tenantId', 'address'])
export class CryptoWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({
    type: 'enum',
    enum: BlockchainNetwork,
  })
  network: BlockchainNetwork;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string; // e.g., "Customer Deposit Wallet"

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
