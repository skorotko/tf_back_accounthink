import { ApiProperty } from "@nestjs/swagger";

export class UpdateXeroDto {
  @ApiProperty({ example: 'clientIdKey', description: 'clientIdKey'})
  readonly clientIdKey: string;

  @ApiProperty({ example: 'clientSecretKey', description: 'clientSecretKey'})
  readonly clientSecretKey: string;
}