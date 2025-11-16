import { ApiProperty } from "@nestjs/swagger";

export class UpdateBankAccountTypeDto {
  @ApiProperty({ example: 'test', description: 'name bank account type' })
  readonly name: string;

  @ApiProperty({ example: 't', description: 'code bank account type' })
  readonly code: string;
}
