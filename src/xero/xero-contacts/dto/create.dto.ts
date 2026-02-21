import { ApiProperty } from "@nestjs/swagger";

export class CreateXeroContactsDto {
  @ApiProperty({ example: 'name', description: 'name'})
  readonly name: string;

  @ApiProperty({ description: 'email' })
  readonly emailAddress?: string;

  // @ApiProperty({ example: 'purchaseDetails', description: 'purchaseDetails'})
  // readonly purchaseDetails?: {
  //   unitPrice: number,
  //   taxType: string,
  //   accountCode?: string,
  //   cOGSAccountCode?: string
  // };
  //
  // @ApiProperty({ example: 'purchaseDetails', description: 'purchaseDetails' })
  // readonly salesDetails?: {
  //   unitPrice: number,
  //   taxType: string,
  //   accountCode: string
  // };
}