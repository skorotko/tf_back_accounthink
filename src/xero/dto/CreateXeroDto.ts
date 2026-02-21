import { ApiProperty } from "@nestjs/swagger";

export class CreateXeroDto {
  @ApiProperty({ example: 1, description: 'companyId'})
  readonly companyId: number;

  @ApiProperty({ example: 'clientIdKey', description: 'clientIdKey'})
  readonly clientIdKey: string;

  @ApiProperty({ example: 'clientSecretKey', description: 'clientSecretKey'})
  readonly clientSecretKey: string;
}