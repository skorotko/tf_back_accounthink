import { ApiProperty } from "@nestjs/swagger";

export class UpdateClassDto {
  @ApiProperty({example: 'Class Name', description: 'Class name'})
  readonly name: string;

  @ApiProperty({example: 'Custom number#111', description: 'Custom class number'})
  readonly number: string;

  @ApiProperty({example: '1', description: 'User Id'})
  readonly userId: number
}