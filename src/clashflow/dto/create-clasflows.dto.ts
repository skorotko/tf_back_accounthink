import { ApiProperty } from "@nestjs/swagger";

export class CreateClasflowsDto {
  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: 'Inventory', description: 'Clasflow name'})
  readonly name: string;
}