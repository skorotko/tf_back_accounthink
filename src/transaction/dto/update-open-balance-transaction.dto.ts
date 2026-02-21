import { ApiProperty } from "@nestjs/swagger";

export class UpdateOpenBalanceTransactionDto {
  @ApiProperty({ example: 'php', description: 'Transaction currency'})
  readonly transactionCurrency: string;

  @ApiProperty({ example: 'php', description: 'Foreign currency' })
  readonly foreignCurrency: string;

  @ApiProperty({example: 'Transaction description or null', description: 'Transaction description'})
  readonly transactionDescription: any;

  @ApiProperty({example: '1000', description: 'Amount'})
  readonly amount: number;

  @ApiProperty({ example: '1000', description: 'Foreign amount' })
  readonly foreignAmount: number;

  @ApiProperty({ example: '01-01-2021', description: 'Transaction Date'})
  readonly transactionDate?: string;
}