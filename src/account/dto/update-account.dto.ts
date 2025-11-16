import { ApiProperty } from "@nestjs/swagger";

export class UpdateAccountDto {
  @ApiProperty({example: 'Inventory', description: 'Account name'})
  readonly name: string;

  @ApiProperty({example: 'Custom account number #54142', description: 'Custom account number'})
  readonly number: string;

  // @ApiProperty({example: 'This new account', description: 'Account description'})
  // readonly description: string;
  //
  // @ApiProperty({example: 'Account remark', description: 'Account remark'})
  // readonly remarks: string;

  @ApiProperty({example: '1'})
  readonly userId: number;

  // @ApiProperty({example: true, description: 'Account status'})
  // readonly active: boolean;

  @ApiProperty({ example: 'User currency identification number' })
  readonly accountCurrencyId: number;

  @ApiProperty({ example: '1', description: 'Identification clashflow' })
  readonly clashflowId: number;
}