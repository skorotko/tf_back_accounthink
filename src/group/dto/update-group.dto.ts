import { ApiProperty } from "@nestjs/swagger";

export class UpdateGroupDto {
  @ApiProperty({example: 'Inventory', description: 'Group name'})
  readonly name: string;

  @ApiProperty({example: 'Custom group number #342'})
  readonly number: string;

  @ApiProperty({example: '1', description: 'User Id'})
  readonly userId: number;

  @ApiProperty({example: 'DR', description: '"DR" or "CR"'})
  readonly DRCRCode: string;

  @ApiProperty({example: true, description: 'Group status'})
  readonly active: boolean;

  @ApiProperty({example: true, description: 'Contra group status'})
  readonly contra: boolean;
}