import { Controller, Get, Param } from "@nestjs/common";
import { TaxTypeService } from "./tax-type.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TaxTopLevelCategory, TaxType } from "./tax-type.model";


@Controller('tax-type')
export class TaxTypeController {
    constructor(private readonly taxTypeService: TaxTypeService) {}

    @ApiOperation({summary: 'Get tax types list method'})
    @ApiResponse({status: 200, type: TaxType})
    @Get('/:type')
    async getAllByType(@Param() params: {
        type: TaxTopLevelCategory
    }) {
        return this.taxTypeService.getAllByType(params.type);
    }

    @ApiOperation({summary: 'Get types with tax types method'})
    @ApiResponse({status: 200})
    @Get()
    async getTypesWithTaxType() {
        return this.taxTypeService.getTypesWithTaxTypes()
    }
}
