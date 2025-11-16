import { ApiProperty } from "@nestjs/swagger";

export class CreateTaxRateDto {
    @ApiProperty({example: 1, description: 'Tax id'})
    saleTaxId?: number;

    @ApiProperty({example: 1, description: 'Tax id'})
    withHoldingTaxId?: number;

    @ApiProperty({example: '10', description: 'Tax rate'})
    readonly rate: number;

    @ApiProperty({example: '25/07/2022', description: 'Start use finance year'})
    readonly financeYear: Date;
}