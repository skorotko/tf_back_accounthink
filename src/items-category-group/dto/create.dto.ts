import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryGroupDto {
  @ApiProperty({example: 1, description: 'companyId'})
  readonly companyId: number;

  @ApiProperty({example: 'Name', description: 'Name'})
  readonly name: string;

  @ApiProperty({example: 'Code', description: 'Code'})
  readonly code: string;
}