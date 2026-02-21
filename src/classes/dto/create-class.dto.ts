import { ApiProperty } from "@nestjs/swagger";

export class CreateClassDto {
  @ApiProperty({example: 'Class Name', description: 'Class name'})
  readonly name: string;

  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '1', description: 'Type id'})
  readonly typeId: number;

  @ApiProperty({example: '1, 2'})
  readonly filePath: string;

  @ApiProperty({example: 'Custom number class or null'})
  readonly number: any;

  @ApiProperty({example: '1', description: 'User Id'})
  readonly userId: number;

  @ApiProperty({example: '1 or 0'})
  readonly contra: number
}