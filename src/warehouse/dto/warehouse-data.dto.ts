import { ApiProperty } from "@nestjs/swagger";

export class WarehouseDataDto {
  @ApiProperty({description: 'Company identification number'})
  readonly companyId: number;

  @ApiProperty({description: 'Warehouse code'})
  readonly warehouseCode: string;

  @ApiProperty({description: 'Warehouse name'})
  readonly warehouseName: string;

  @ApiProperty({description: 'Manager identification number'})
  readonly managerId: number;

  @ApiProperty({description: 'Address'})
  readonly address?: string;

  @ApiProperty({description: 'Phone'})
  readonly phone?: string;

  @ApiProperty({description: 'Phone'})
  readonly phone2?: string;

  @ApiProperty({description: 'Email address'})
  readonly email?: string;

  @ApiProperty({description: 'Business Unit identification number'})
  readonly buId: number;

  @ApiProperty({description: 'Project identification number'})
  readonly projectId?: number;

  @ApiProperty({description: 'identification for system'})
  readonly system?: boolean;
}