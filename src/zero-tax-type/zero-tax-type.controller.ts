import { Controller, Get } from "@nestjs/common";
import { ZeroTaxTypeService } from "./zero-tax-type.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('zero-tax-type')
export class ZeroTaxTypeController {
  constructor(private readonly zeroTaxTypeService: ZeroTaxTypeService) {}

  @ApiOperation({summary: 'Get all zero tax types method'})
  @ApiResponse({status: 200})
  @Get()
  getAll () {
    return this.zeroTaxTypeService.getAll()
  }
}
