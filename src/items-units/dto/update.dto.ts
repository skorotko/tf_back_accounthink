import { ApiProperty } from "@nestjs/swagger";

export class UpdateItemsUnitDto {
  @ApiProperty({example: 'Name', description: 'Name'})
  readonly name: string;

  @ApiProperty({example: 'Code', description: 'Code'})
  readonly code: string;
}