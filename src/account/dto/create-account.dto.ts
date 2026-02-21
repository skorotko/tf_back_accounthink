import { ApiProperty } from "@nestjs/swagger";

export class CreateAccountDto {
  @ApiProperty({ example: 'Inventory', description: 'Account name' })
  name: string;

  @ApiProperty({ example: '1', description: 'Identification group' })
  readonly groupId: number;

  @ApiProperty({ example: '1', description: 'Identification company' })
  readonly companyId: number;

  @ApiProperty({ example: '1' })
  readonly userId?: number;

  @ApiProperty({ example: '1 or null' })
  readonly parentId: any;

  @ApiProperty({ example: '["1", "2", "3"]' })
  readonly filePath: string;

  @ApiProperty({ example: '1', description: 'Identification clashflow' })
  readonly clashflowId: number;

  @ApiProperty({ example: 'account' })
  readonly type: string;

  @ApiProperty({ example: 'Custom account number' })
  readonly number?: any;

  @ApiProperty({ example: 'Company currency identification number' })
  readonly currencyId: number;

  @ApiProperty({ example: 'User currency identification number' })
  readonly accountCurrencyId: any;

  // @ApiProperty({example: true, description: 'Account status'})
  // readonly active: boolean;

  @ApiProperty({ example: true, description: 'Bank Account' })
  readonly isBankAccount: boolean;

  @ApiProperty({ example: true, description: 'Credit card Account' })
  readonly isCreditCardAccount: boolean;

  @ApiProperty({
    example: '1',
    description: 'Tax identification number or null',
  })
  readonly taxId: any;

  @ApiProperty({ example: 1 })
  readonly taxTypeId?: number;

  @ApiProperty({ example: 1, description: 'Bank identification number' })
  readonly bankId: any;

  @ApiProperty({ example: 1, description: 'Credit card identification number' })
  readonly CCId: any;

  @ApiProperty({ example: 100 })
  readonly amount?: number;

  @ApiProperty({ example: 1 })
  readonly cashAccountTypeId?: number;

  @ApiProperty({ example: 1 })
  readonly show?: boolean;

  readonly countryId?: number;
}