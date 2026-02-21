import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Types } from "./types.model";
import { TypesService } from "./types.service";

@ApiTags('Types')
@Controller('types')
export class TypesController {

  constructor(private typeService: TypesService) {}

  @ApiOperation({summary: 'Get all types'})
  @ApiResponse({status: 200, type: Types})
  @Get()
  getAll() {
    return this.typeService.getAllTypes()
  }
}
