import { ApiProperty } from "@nestjs/swagger";

export class CreateJournalEntriesTransactionDto {
  @ApiProperty({ example: 'php', description: 'Company currency' })
  readonly transactionCurrency: string;

  @ApiProperty({ example: 'php', description: 'Foreign currency' })
  readonly foreignCurrency: string;

  @ApiProperty({ example: 'php', description: 'Reference Tag' })
  readonly referenceTag: any;

  @ApiProperty({ example: 'php', description: 'Source Ref' })
  readonly sourceRef: any;

  @ApiProperty({ example: '1', description: 'Exchange Rate' })
  readonly exchangeRate: number;

  @ApiProperty({ example: 'General', description: 'Entry type name' })
  readonly entryTypeName: string;

  @ApiProperty({ example: '1', description: 'Identification company' })
  readonly companyId: number;

  @ApiProperty({ example: 'No tax, include, exclude', description: 'Identification type tax' })
  readonly taxTypeId: number;

  @ApiProperty({ example: '1', description: 'User id' })
  readonly userId: number;

  @ApiProperty({ example: '[{transactionId: 1, amount: 1000}]', description: 'Array of transactions' })
  readonly journalList: object[];

  @ApiProperty({ example: 'Transaction description or null', description: 'Transaction description' })
  readonly transactionDescription: any;

  @ApiProperty({ example: '1637588339663', description: 'Date timestamp' })
  readonly journalDate: any;

  @ApiProperty({ example: '1637588339663', description: 'Date timestamp' })
  readonly documentDate: any;

  @ApiProperty({ example: 'GENERAL'})
  readonly transactionCode?: string;
}