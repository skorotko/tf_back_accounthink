import { ApiProperty } from "@nestjs/swagger";

export class GetTaxAccountsWithEndDateDto {
  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '01-20-2023', description: 'MM-DD-YYYY'})
  endDate: string;
}