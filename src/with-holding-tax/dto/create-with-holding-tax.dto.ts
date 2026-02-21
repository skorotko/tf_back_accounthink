import { ApiProperty } from "@nestjs/swagger";

export class CreateWithHoldingTaxDto {
    @ApiProperty({example: 1, description: 'countryId'})
    countryId: number;

    @ApiProperty({example: 1, description: 'typeId'})
    typeId: number;

    @ApiProperty({example: 'Name', description: 'Name'})
    name: string;

    @ApiProperty({example: 'View Tax Code', description: 'View Tax Code'})
    viewCode: string;

    @ApiProperty({example: 'Code', description: 'Code'})
    code: string;

    @ApiProperty({example: 1, description: 'With Holding Tax Remark ID'})
    remarkId: number;

    @ApiProperty({example: 'description', description: 'description'})
    description?: string;
}