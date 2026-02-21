import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SaleTaxService } from "./sale-tax.service";
import { CreateSaleTaxRequestDto } from "./dto/CreateSaleTaxDataDto";
import { SaleTax } from "./sale-tax.model";
import { UpdateSaleTaxDto } from "./dto/UpdateSaleTaxDto";
import { BulkCreateSaleTaxDto } from "./dto/bulk-create-sale-tax.dto";

@Controller('sale-tax')
export class SaleTaxController {
    constructor(
        private readonly saleTaxService: SaleTaxService
    ) {}


    @ApiOperation({summary: 'Create method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Post()
    async create(
        @Body() data: CreateSaleTaxRequestDto
    ) {
        return this.saleTaxService.create(data.taxData, data.taxRateData);
    }

    @ApiOperation({summary: 'Create method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Post('/bulk-create')
    async bulkCreate (@Body() data: BulkCreateSaleTaxDto[]) {
        return this.saleTaxService.bulkCreate(data);
    }

    @ApiOperation({summary: 'Update method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Put('/:id')
    update(
        @Param('id') id: number,
        @Body() data: {
            taxData: UpdateSaleTaxDto,
            rate: number
        }
    ) {
        return this.saleTaxService.update(id, data.taxData, data.rate)
    }

    @ApiOperation({summary: 'Delete method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Delete('/:id')
    delete(@Param('id') id: number) {
        return this.saleTaxService.delete(id)
    }

    @ApiOperation({summary: 'Change status'})
    @ApiResponse({status: 200, type: SaleTax})
    @Put('/change-status/:id')
    changeStatus(
        @Param('id') id: number,
        @Body('status') status: boolean
    ) {
        return this.saleTaxService.changeActiveStatus(
            id,
            status
        )
    }

    @ApiOperation({summary: 'Create tax method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Get('/:id')
    async get(@Param('id') id: number) {
        return this.saleTaxService.getOne(id);
    }

    @ApiOperation({summary: 'Create tax method'})
    @ApiResponse({status: 200, type: SaleTax})
    @Get('/get-all-by-country/:countryId')
    async getAllByCountryId(@Param('countryId') countryId: number) {
        return this.saleTaxService.getAllByCountryId(countryId);
    }

    @ApiOperation({summary: 'Get all sale tax by id sale tax list'})
    //@ApiResponse({status: 200, type: Array<SaleTax>})
    @Get('list-by-id/:idList')
    async getAllByIdList(@Param() param: {
        idList: string
    }) {
        return this.saleTaxService.getAllByIdList(JSON.parse(param.idList))
    }
}
