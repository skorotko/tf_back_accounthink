import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateRequestDto {
  @ApiProperty({
    example: 1500.75,
    description: 'Новая сумма',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    example: 'Updated purpose',
    description: 'Новое назначение',
    required: false,
  })
  @IsString()
  @IsOptional()
  purpose?: string;
}
