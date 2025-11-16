import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoriesDto {
  @ApiProperty({example: 1, description: 'companyId'})
  readonly companyId: number;

  @ApiProperty({example: 'Name', description: 'Name'})
  readonly name: string;

  @ApiProperty({example: 'Code', description: 'Code'})
  readonly code: string;

  @ApiProperty({ example: 1, description: 'ParentId' })
  readonly parentId: number;

  @ApiProperty({ example: 1, description: 'groupId' })
  readonly groupId: number;
}