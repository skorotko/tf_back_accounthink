import { ApiProperty } from "@nestjs/swagger";

export class InlineChangeNameTemplateTransactionDto {
  @ApiProperty({ example: 'GENERAL'})
  readonly name: string | null;
}