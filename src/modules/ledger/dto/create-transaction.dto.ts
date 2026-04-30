import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionLineDto } from './create-transaction-line.dto';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;

  @IsArray()
  @ArrayMinSize(2) // Must have at least 2 lines (debit and credit)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionLineDto)
  lines: CreateTransactionLineDto[];

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
