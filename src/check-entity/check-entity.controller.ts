import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CheckEntityService } from "./check-entity.service";

@ApiTags('check-entity')
@Controller('check-entity')
export class CheckEntityController {

  constructor(private checkEntityService: CheckEntityService) { }

  @ApiOperation({ summary: 'Get all types' })
  @ApiResponse({ status: 200})
  @Get('/:id/:entityTypeId')
  check(@Param() params: {
    id: number,
    entityTypeId: number,
  }) {
    return this.checkEntityService.checkEntity(params.id, params.entityTypeId);
  }
}
