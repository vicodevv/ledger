export class ExchangeRateResponseDto {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  validFrom: Date;
  validTo: Date;
  source: string;
  createdAt: Date;
}
