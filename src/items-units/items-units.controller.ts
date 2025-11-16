import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ItemsUnitsService } from "./items-units.service";
import { ItemsUnits } from "./items-units.model";
import { CreateItemsUnitDto } from "./dto/create.dto";
import { UpdateItemsUnitDto } from "./dto/update.dto";

@Controller('items-units')
export class ItemsUnitsController {
  constructor( private readonly service: ItemsUnitsService ) {}

  @ApiOperation({summary: 'Create method'})
  @ApiResponse({status: 200, type: ItemsUnits})
  @Post()
  async create(
    @Body() data: CreateItemsUnitDto
  ) {
    return this.service.create(data);
  }

  @ApiOperation({summary: 'Update method'})
  @ApiResponse({status: 200, type: ItemsUnits})
  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateItemsUnitDto
  ) {
    return this.service.update(id, data)
  }

  @ApiOperation({summary: 'Delete method'})
  @ApiResponse({status: 200, type: ItemsUnits})
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.service.delete(id)
  }

  @ApiOperation({summary: 'Get by id method'})
  @ApiResponse({status: 200, type: ItemsUnits})
  @Get('/:id')
  async getById(@Param('id') id: number) {
    return this.service.getById(id);
  }

  @ApiOperation({summary: 'Get list by companyId method'})
  @ApiResponse({status: 200, type: ItemsUnits})
  @Get('/list/:companyId')
  async getAllByCountryId(@Param('companyId') companyId: number) {
    return this.service.getListByCompanyId(companyId);
  }

  @ApiOperation({ summary: 'Get list by companyId method' })
  @ApiResponse({ status: 200, type: ItemsUnits })
  @Get('/sortList/:companyId')
  async getAllByCompanyIdWithSort(@Param('companyId') companyId: number) {
    return this.service.getListByCompanyIdWithSortByName(companyId);
  }
}
