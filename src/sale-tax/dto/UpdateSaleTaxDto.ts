import { ApiProperty } from "@nestjs/swagger";

export class UpdateSaleTaxDto {
    @ApiProperty({example: 'Tax Name', description: 'Tax name'})
    readonly name: string;

    @ApiProperty({example: 'Tax Code', description: 'Tax code'})
    readonly code: string;

    @ApiProperty({example: 'View Tax Code', description: 'View Tax Code'})
    viewCode: string;

    @ApiProperty({example: 'description', description: 'description'})
    readonly description?: string;
}