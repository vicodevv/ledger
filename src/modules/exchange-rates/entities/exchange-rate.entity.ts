import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('exchange_rates')
@Index(['fromCurrency', 'toCurrency', 'validFrom'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_currency', type: 'varchar', length: 3 })
  fromCurrency: string;

  @Column({ name: 'to_currency', type: 'varchar', length: 3 })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  rate: number;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'timestamp', nullable: true })
  validTo: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string; // 'manual', 'api', 'cbn'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
