import { ApiProperty } from "@nestjs/swagger";

export class GetCompanyLedgerDto {
  @ApiProperty({example: '1'})
  readonly companyId: number;

  @ApiProperty({example: true})
  readonly transactionCode: string;

  @ApiProperty({example: `JSON: {"filterBy": "tax", "taxTypeId": "1", "taxId": "1"}`})
  readonly filter?: string;

  readonly orderBy?: string;

  readonly order?: string;

  readonly page: number;

  readonly count: number;

  readonly transactionType: string | null;
}