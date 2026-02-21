import { ApiProperty } from "@nestjs/swagger";

export class UpdateNameAccountDto {
  @ApiProperty({example: '1', description: 'Name account string'})
  readonly name: string;
}