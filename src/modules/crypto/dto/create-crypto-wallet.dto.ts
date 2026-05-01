import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';
import { BlockchainNetwork } from '../entities/crypto-wallet.entity';

export class CreateCryptoWalletDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @Length(26, 255) // Bitcoin addresses ~26-35 chars, Ethereum 42 chars
  address: string;

  @IsEnum(BlockchainNetwork)
  @IsNotEmpty()
  network: BlockchainNetwork;

  @IsString()
  @IsOptional()
  label?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
