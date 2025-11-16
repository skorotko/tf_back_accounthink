import { ApiProperty } from "@nestjs/swagger";

export class UpdateActiveAccountDto {
    @ApiProperty({example: true, description: 'Account status'})
    readonly active: boolean;
}