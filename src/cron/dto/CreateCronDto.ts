import { ApiProperty } from "@nestjs/swagger";
import { entityTypeId } from '../cron.service';

export class CreateCronDto {
    @ApiProperty({ example: 1, description: 'Entity id'})
    entityId: number;

    @ApiProperty({ example: 1, description: 'Entity Type id'})
    entityTypeId: entityTypeId;

    @ApiProperty({ example: 'Test', description: 'description'})
    description: string;

    @ApiProperty({ example: '25/07/2022', description: 'Date cron implaminatation'})
    cronDate: string;
}