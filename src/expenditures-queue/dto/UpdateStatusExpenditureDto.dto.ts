import {
  IsInt,
  IsNumber,
  IsString,
  IsISO8601,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateStatusExpenditureDto {
  @IsISO8601()
  date: Date;

  @IsString()
  @IsOptional()
  purposeReject?: string;
}
