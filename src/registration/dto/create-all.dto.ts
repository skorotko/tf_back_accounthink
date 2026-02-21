import { ApiProperty } from "@nestjs/swagger";

export class CreateAllDto {
  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '1', description: 'Company currency identification number'})
  readonly currencyId: number;

  @ApiProperty({example: ['3.1', '3.2', '5.1.1'], description: 'COA db codes'})
  readonly dbCodeArr: Array<string>
}