import { ApiProperty } from "@nestjs/swagger";

export class CreateSaleTaxDto {
    @ApiProperty({example: 'Tax Name', description: 'Tax name'})
    readonly name: string;

    @ApiProperty({example: 'Tax Code', description: 'Tax code'})
    readonly code: string;

    @ApiProperty({example: 'View Tax Code', description: 'View Tax Code'})
    readonly viewCode: string;

    @ApiProperty({example: 1, description: 'Identification country'})
    readonly countryId: number;

    @ApiProperty({example: 1, description: 'Tax type id'})
    readonly typeId: number;

    @ApiProperty({description: 'Tax type id with zeroTaxType table'})
    readonly taxTypeId: number;

    @ApiProperty({example: 'description', description: 'description'})
    readonly description?: string;
}