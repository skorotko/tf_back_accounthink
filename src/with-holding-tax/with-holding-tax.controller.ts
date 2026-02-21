import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { WithHoldingTaxService } from "./with-holding-tax.service";
import { CreateWithHoldingTaxRequestDto } from "./dto/create-with-holding-tax-request.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WithHoldingTax } from "./with-holding-tax.model";
import { UpdateWithHoldingTaxDto } from "./dto/update-with-holding-tax.dto";
import { BulkCreateWithHoldingTaxDto } from "./dto/bulk-create-withholding-tax.dto";

@Controller('with-holding-tax')
export class WithHoldingTaxController {
    constructor(private readonly withHoldingTaxService: WithHoldingTaxService) {}

    @ApiOperation({summary: 'Create method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Post()
    async create (@Body() data: CreateWithHoldingTaxRequestDto) {
        return this.withHoldingTaxService.create(data.taxData, data.taxRateData);
    }

    @ApiOperation({summary: 'Create method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Post('/bulk-create')
    async bulkCreate (@Body() data: BulkCreateWithHoldingTaxDto[]) {
        return this.withHoldingTaxService.bulkCreate(data);
    }

    @ApiOperation({summary: 'Update method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Put('/:id')
    update(
        @Param('id') id: number,
        @Body() data: {
            taxData: UpdateWithHoldingTaxDto,
            rate: number
        }
    ) {
        return this.withHoldingTaxService.update(id, data.taxData, data.rate)
    }

    @ApiOperation({summary: 'Delete method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Delete('/:id')
    delete(@Param('id') id: number) {
        return this.withHoldingTaxService.delete(id)
    }

    @ApiOperation({summary: 'Change status'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Put('/change-status/:id')
    changeStatus(
        @Param('id') id: number,
        @Body('status') status: boolean
    ) {
        return this.withHoldingTaxService.changeActiveStatus(
            id,
            status
        )
    }

    @ApiOperation({summary: 'Get tax method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Get('/:id')
    async get(@Param('id') id: number) {
        return this.withHoldingTaxService.getOne(id);
    }

    @ApiOperation({summary: 'Get tax list method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Get('/get-all-by-country/:countryId/:remarkId/:typeId')
    async getAllByCountryId(@Param() params: {
        countryId: number
        remarkId: any,
        typeId: any
    }) {
        params.remarkId = params.remarkId === 'null' || params.remarkId === null  ? null : parseInt(params.remarkId);
        params.typeId = params.typeId === 'null' || params.typeId === null  ? null : parseInt(params.typeId);
        return this.withHoldingTaxService.getAllByCountryId(params.countryId, params.remarkId, params.typeId);
    }

    @ApiOperation({summary: 'Get all tax by id tax list'})
    //@ApiResponse({status: 200, type: Array<WithHoldingTax>})
    @Get('list-by-id/:idList')
    async getAllByIdList(@Param() param: {
        idList: string
    }) {
        return this.withHoldingTaxService.getAllByIdList(JSON.parse(param.idList))
    }
}
