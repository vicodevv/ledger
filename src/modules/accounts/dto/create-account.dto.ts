import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  IsUUID,
} from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
