import { ApiProperty } from "@nestjs/swagger";

export class CreateItemsContactsDto {
  @ApiProperty({example: 1, description: 'companyId'})
  readonly companyId: number;

  @ApiProperty({ example: 'xeroItemId', description: 'xeroItemId'})
  readonly xeroItemId: string;

  @ApiProperty({ example: 'xeroClientId', description: 'xeroClientId'})
  readonly xeroClientId: string;

  @ApiProperty({ example: 'partNumber', description: 'partNumber' })
  readonly partNumber: string;

  @ApiProperty({ example: 1, description: 'price' })
  readonly price: number;

  @ApiProperty({ example: 1, description: 'currencyId' })
  readonly currencyId: number;
}