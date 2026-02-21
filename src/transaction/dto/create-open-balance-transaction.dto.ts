import { ApiProperty } from "@nestjs/swagger";

export class CreateOpenBalanceTransactionDto {
  @ApiProperty({ example: 'php', description: 'Transaction currency'})
  readonly transactionCurrency: string;

  @ApiProperty({ example: 'php', description: 'Foreign currency' })
  readonly foreignCurrency: string;

  @ApiProperty({example: '1', description: 'Identification transaction'})
  readonly transactionId: number;

  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '1', description: 'Identification account'})
  readonly accountId: number;

  @ApiProperty({example: '1', description: 'User id'})
  readonly userId: number;

  // @ApiProperty({example: '[{transactionId: 1, amount: 1000}]', description: 'Array of transactions'})
  // readonly transactionArray: object[];

  @ApiProperty({example: 'Transaction description or null', description: 'Transaction description'})
  readonly transactionDescription: any;

  @ApiProperty({example: '1000', description: 'Amount'})
  readonly amount: number;

  @ApiProperty({ example: '1000', description: 'Foreign amount' })
  readonly foreignAmount: number;

  @ApiProperty({ example: '01-01-2021', description: 'Transaction Date'})
  readonly transactionDate?: string;

  @ApiProperty({ example: 'add/post', description: 'Open balanc status' })
  readonly status: string;
}