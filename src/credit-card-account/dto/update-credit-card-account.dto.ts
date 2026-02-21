import { ApiProperty } from "@nestjs/swagger";

export class UpdateCreditCardAccountDto {
  @ApiProperty({ example: '30', description: '' })
  readonly reconciliationDays: number;

  @ApiProperty({ example: '31.02.03', description: '' })
  readonly reconciliationStartDate: number;

  @ApiProperty({ example: '3000', description: '' })
  readonly creditLimit: number;

  @ApiProperty({ example: 'Inventory', description: 'Financial institution'})
  readonly financialInstitution: string;

  @ApiProperty({example: 'example@email.ru', description: 'Web site'})
  readonly website: string;

  @ApiProperty({ example: '234676879676553', description: 'card number' })
  readonly cardNumber: string;

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
}
