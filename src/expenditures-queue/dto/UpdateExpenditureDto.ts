import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class UpdateExpenditureDto {
  @ApiProperty({
    example: 'Vendor Inc.',
    description: 'Название поставщика',
    required: false,
  })
  @IsString()
  @IsOptional()
  vendorName?: string;

  @ApiProperty({
    example: '123456789',
    description: 'ИНН поставщика',
    required: false,
  })
  @IsString()
  @IsOptional()
  vendorTin?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Адрес поставщика',
    required: false,
  })
  @IsString()
  @IsOptional()
  vendorContactAddress?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Тлф поставщика',
    required: false,
  })
  @IsString()
  @IsOptional()
  vendorPhone?: string;

  @ApiProperty({
    example: '2025-03-24',
    description: 'Дата транзакции',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({
    example: '123456789',
    description: 'transactionArunumber',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionArunumber?: string;

  @ApiProperty({
    example: '123456789',
    description: 'transactionRcptnumber',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionRcptnumber?: string;

  @ApiProperty({
    example: 100.0,
    description: 'Сумма с НДС',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  vatableAmount?: number;

  @ApiProperty({
    example: 100.0,
    description: 'Полная сумма',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    example: 118.0,
    description: 'Сумма с включенным НДС',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  vatableAmountInclusive?: number;

  @ApiProperty({
    example: 118.0,
    description: 'vatableAmountExclusive',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  vatableAmountExclusive?: number;

  @ApiProperty({
    example: 118.0,
    description: 'vatableAmountWithoutTax',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  vatableAmountWithoutTax?: number;

  @ApiProperty({
    example: 118.0,
    description: 'serviceCharge',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  serviceCharge?: number;

  @ApiProperty({
    example: 118.0,
    description: 'serviceCharge',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amountTendered?: number;

  @ApiProperty({
    example: 'Cash',
    description: 'Способ оплаты',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({
    example: 118.0,
    description: 'serviceCharge',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  chargeGiven?: number;

  @ApiProperty({
    example: 118.0,
    description: 'serviceCharge',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  tips?: number;
}
