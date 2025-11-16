import { ApiProperty } from "@nestjs/swagger";
import { TaxTopLevelCategory } from "../../tax-type/tax-type.model";

export class GetTaxAccountsDto {
  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '1', description: 'Identification company'})
  countryId: number;

  @ApiProperty({example: TaxTopLevelCategory.sale, description: `enum: ${TaxTopLevelCategory}`})
  taxTopType: TaxTopLevelCategory
}