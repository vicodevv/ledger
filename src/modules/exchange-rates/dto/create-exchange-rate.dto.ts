import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  toCurrency: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsDateString()
  @IsNotEmpty()
  validFrom: string;

  @IsDateString()
  @IsOptional()
  validTo?: string;

  @IsString()
  @IsOptional()
  source?: string;
}
