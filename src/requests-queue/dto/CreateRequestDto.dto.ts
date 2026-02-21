import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsString,
  IsISO8601,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: 123,
    description: 'ID компании',
    required: true,
  })
  @IsInt()
  companyId: number;

  @ApiProperty({
    example: 123,
    description: 'ID счета',
    required: true,
  })
  @IsInt()
  accountId: number;

  @ApiProperty({
    example: 456,
    description: 'ID пользователя, создающего запрос',
    required: true,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: '2025-03-24T12:34:56Z',
    description: 'Дата и время запроса в формате ISO8601',
    required: true,
  })
  @IsISO8601()
  @IsOptional()
  requestDate: Date;

  @ApiProperty({
    example: 1000.5,
    description: 'Сумма запроса',
    required: true,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'Office supplies reimbursement',
    description: 'Назначение платежа',
    required: true,
  })
  @IsString()
  purpose: string;

  @IsBoolean()
  urgent: boolean;
}
