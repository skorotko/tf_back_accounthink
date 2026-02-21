import {
  IsInt,
  IsNumber,
  IsString,
  IsISO8601,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateRejectExpenditureDto {
  @IsISO8601()
  date: Date;

  @IsNumber()
  expenditureAccountId: number;

  @IsString()
  transactionCurrency: string;

  @IsString()
  foreignCurrency: string;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  userId: number;
}
