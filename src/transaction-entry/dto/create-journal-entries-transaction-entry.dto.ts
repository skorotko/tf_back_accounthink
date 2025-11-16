import { ApiProperty } from "@nestjs/swagger";

export class CreateJournalEntriesTransactionEntryDto {
  @ApiProperty({example: 1, description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: 1, description: 'Transaction identification number'})
  readonly transactionId: number;

  @ApiProperty({example: 1, description: 'User Id'})
  readonly userId: number;

  @ApiProperty({ example: '1000', description: 'Exchange Rate' })
  readonly exchangeRate: any

  @ApiProperty({ example: 'No tax, exclude, include', description: 'Identification tax type' })
  readonly taxTypeId: number;
}