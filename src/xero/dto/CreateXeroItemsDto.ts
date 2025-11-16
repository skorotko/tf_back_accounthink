import { ApiProperty } from "@nestjs/swagger";

export class CreateXeroItemsDto {
  @ApiProperty({ example: 1, description: 'code'})
  readonly code: string;

  @ApiProperty({ example: 'name', description: 'name'})
  readonly name: string;

  @ApiProperty({ example: 'description', description: 'description' })
  readonly description: string;

  @ApiProperty({ example: 'inventoryAssetAccountCode', description: 'inventoryAssetAccountCode' })
  readonly inventoryAssetAccountCode?: string;

  @ApiProperty({ example: 'purchaseDetails', description: 'purchaseDetails'})
  readonly purchaseDetails?: {
      unitPrice: number,
      taxType: string,
      accountCode?: string,
      cOGSAccountCode?: string
  };

  @ApiProperty({ example: 'purchaseDetails', description: 'purchaseDetails' })
  readonly salesDetails?: {
    unitPrice: number,
    taxType: string,
    accountCode: string
  };
}