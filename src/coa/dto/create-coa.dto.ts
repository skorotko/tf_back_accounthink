import { ApiProperty } from "@nestjs/swagger";

export class CreateCoaDto {

  readonly companyId: number;

  readonly currencyId: number;

  readonly methodOfAccountingId: number;

  readonly businessTypeId: number;

  readonly businessFormationId: number;
  
}