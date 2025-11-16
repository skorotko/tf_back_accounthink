import { ApiProperty } from "@nestjs/swagger";

export class UpdateBankAccountDto {
  @ApiProperty({ example: '1000.00', description: '' })
  readonly currentBalance: number;

  @ApiProperty({ example: '2000.00', description: '' })
  readonly overdraftLimit: number;

  @ApiProperty({ example: '30', description: '' })
  readonly reconciliationDays: number;

  @ApiProperty({ example: '31.02.03', description: '' })
  readonly reconciliationStartDate: number;

  @ApiProperty({example: true, description: ''})
  readonly allowBalancingTransaction: boolean;

  @ApiProperty({ example: 'Inventory', description: 'Financial institution'})
  readonly financialInstitution: string;

  @ApiProperty({example: 'example@email.ru', description: 'Web site'})
  readonly website: string;

  @ApiProperty({ example: '8234153512312', description: 'bank swift code' })
  readonly bankSwiftCode: string;

  @ApiProperty({ example: '4213123213311', description: 'iban' })
  readonly IBAN: string;

  @ApiProperty({ example: '456453425432312', description: 'bank code' })
  readonly bankCode: string;

  @ApiProperty({ example: '234676879676553', description: 'account number' })
  readonly accountNumber: string;

  @ApiProperty({ example: 'Ivan', description: 'bank manager name' })
  readonly bankManagerName: string;

  @ApiProperty({ example: 'ivan@email.ru', description: 'bank manager email' })
  readonly bankManagerEmail: string;

  @ApiProperty({ example: '031234124', description: 'bank manager phone' })
  readonly bankManagerPhone: string;

  @ApiProperty({ example: '312412413', description: 'bank manager fax' })
  readonly BankManagerFax: string;

  @ApiProperty({ example: '1' })
  readonly userId: number;

  @ApiProperty({ example: '1' })
  readonly buId: number;

  @ApiProperty({ example: '1' })
  readonly taxCodeId: number;

  @ApiProperty({ example: '1' })
  readonly buUserId: number;

  @ApiProperty({ example: '1' })
  readonly bankAccountTypeID: number;

  @ApiProperty({ example: 'false' })
  readonly inactive: boolean;

  @ApiProperty({ example: 'true' })
  readonly close: boolean;
  
}
