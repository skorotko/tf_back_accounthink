import {
  IsInt,
  IsNumber,
  IsString,
  IsISO8601,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateIssueRequestDto {
  @IsISO8601()
  date: Date;

  @IsNumber()
  bankAccountId: number;

  @IsString()
  transactionCurrency: string;

  @IsString()
  foreignCurrency: string;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  userId: number;
}
