import { ApiProperty } from "@nestjs/swagger";

export class CreateOpenBalanceAllocationTransactionDto {
  @ApiProperty({ example: 1, description: 'parentTransactionId' })
  readonly parentTransactionId: number;

  @ApiProperty({example: 'Account Name', description: 'Account Name'})
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

  @ApiProperty({example: '[{transactionId: 1, amount: 1000}]', description: 'Array of transactions'})
  readonly transactionArray: object[];

  @ApiProperty({example: 'Transaction description or null', description: 'Transaction description'})
  readonly transactionDescription: any;

  @ApiProperty({example: '1000', description: 'Amount'})
  readonly amount: number;

  @ApiProperty({ example: '1000', description: 'Foreign amount' })
  readonly foreignAmount: number

}