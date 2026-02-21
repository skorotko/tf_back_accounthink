import { ApiProperty } from "@nestjs/swagger";

export class GetTaxReportDto {
  @ApiProperty({example: 1, description: 'companyId'})
  readonly companyId: number;

  @ApiProperty({example: '14-05-2024', description: 'End Date for query'})
  readonly endDate: string;
}