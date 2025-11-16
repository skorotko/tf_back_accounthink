import { ApiProperty } from "@nestjs/swagger";

export class CreateTaxAccountDto {
  @ApiProperty({example: '1', description: 'Tax identification number'})
  readonly taxId: number;

  @ApiProperty({ example: '1', description: 'Tax type identification number' })
  readonly taxTypeId: number;
}