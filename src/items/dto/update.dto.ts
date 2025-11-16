import { ApiProperty } from "@nestjs/swagger";

export class UpdateItemsDto {
  
  @ApiProperty({ example: 'notes', description: 'notes' })
  readonly notes: string;

  @ApiProperty({ example: true, description: 'isInactive' })
  readonly isInactive: boolean;

  @ApiProperty({ example: true, description: 'isPurchase' })
  readonly isPurchase: boolean;

  @ApiProperty({ example: true, description: 'isSell' })
  readonly isSell: boolean;

}