import { ApiProperty } from "@nestjs/swagger";

export class UpdateItemsContactsDto {
  @ApiProperty({ example: 'partNumber', description: 'partNumber' })
  readonly partNumber: string;

  @ApiProperty({ example: 1, description: 'price' })
  readonly price: number;

  @ApiProperty({ example: 1, description: 'currencyId' })
  readonly currencyId: number;
}