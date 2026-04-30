import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateTransactionLineDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(0)
  debit: number;

  @IsNumber()
  @Min(0)
  credit: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  exchangeRate?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
