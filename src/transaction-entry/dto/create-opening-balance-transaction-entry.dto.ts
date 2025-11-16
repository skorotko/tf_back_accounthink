import { ApiProperty } from "@nestjs/swagger";

export class CreateOpeningBalanceTransactionEntryDto {
  @ApiProperty({example: 1, description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: 1, description: 'Transaction identification number'})
  readonly transactionId: number;

  @ApiProperty({example: 1, description: 'Account identification number'})
  readonly accountId: number;

  @ApiProperty({example: 'DR', description: '"DR" or "CR""'})
  readonly DRCRCode: string;

  @ApiProperty({example: 1, description: 'User Id'})
  readonly userId: number;

  @ApiProperty({ example: 1, description: '1000' })
  readonly transactionOpeningBalance: number;

  @ApiProperty({ example: '1000', description: 'Foreign amount' })
  readonly foreignAmount: number
}