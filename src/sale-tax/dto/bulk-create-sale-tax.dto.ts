import { ApiProperty } from "@nestjs/swagger";

export class BulkCreateSaleTaxDto {
  @ApiProperty({example: 1, description: 'countryId'})
  readonly countryId: number;

  @ApiProperty({example: 1, description: 'typeId'})
  readonly typeId: number;

  @ApiProperty({description: 'Tax type id with zeroTaxType table'})
  readonly taxTypeId: number;

  @ApiProperty({example: 'Name', description: 'Name'})
  readonly name: string;

  @ApiProperty({example: 'Code', description: 'Code'})
  readonly code: string;

  @ApiProperty({example: 'View Tax Code', description: 'View Tax Code'})
  viewCode: string;

  @ApiProperty({example: '10', description: 'Tax rate'})
  readonly rate: number;

  @ApiProperty({example: '25/07/2022', description: 'Start use finance year'})
  readonly financeYear: Date;

  @ApiProperty({example: 'description', description: 'description'})
  readonly description?: string;
}