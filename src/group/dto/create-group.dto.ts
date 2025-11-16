import { ApiProperty } from "@nestjs/swagger";

export class CreateGroupDto {
  @ApiProperty({example: 'Inventory', description: 'Group name'})
  readonly name: string;

  @ApiProperty({example: '1', description: 'Identification company'})
  readonly companyId: number;

  @ApiProperty({example: '1', description: 'Identification class'})
  readonly classId: number;

  @ApiProperty({example: '1', description: 'Identification clashflow'})
  readonly clashflowId: number;

  @ApiProperty({example: '1', description: 'User Id'})
  readonly userId: number;

  @ApiProperty({example: '1, 1, 1'})
  readonly filePath: string[];

  @ApiProperty({example: 'Custom group number'})
  readonly number: any;

  @ApiProperty({example: true, description: 'Group status'})
  readonly active: boolean;

  @ApiProperty({example: 'DR', description: 'DR or CR group code'})
  readonly DRCRCode: string;

  @ApiProperty({example: true, description: 'Contra group status'})
  readonly contra: boolean;
}