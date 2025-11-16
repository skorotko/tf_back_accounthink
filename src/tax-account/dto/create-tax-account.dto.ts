import { ApiProperty } from "@nestjs/swagger";
import { TaxTopLevelCategory } from "../../tax-type/tax-type.model";

export class CreateTaxAccountDto {
  @ApiProperty({example: 1, description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: 1, description: 'Identification company currency'})
  readonly currencyId: number;

  @ApiProperty({example: 1, description: 'Identification tax'})
  readonly taxId: number;

  @ApiProperty({example: TaxTopLevelCategory.sale, description: `ENUM: ${TaxTopLevelCategory}`})
  readonly taxTopType: TaxTopLevelCategory
}