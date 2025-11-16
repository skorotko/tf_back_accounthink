import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ItemsBrands } from "./items-brands.model";
import { ItemsBrandsService } from "./items-brands.service";
import { CreateItemsBrandDto } from "./dto/create.dto";
import { UpdateItemsBrandDto } from "./dto/update.dto";

@Controller('items-brands')
export class ItemsBrandsController {

  constructor(
    private readonly service: ItemsBrandsService
  ) {}


  @ApiOperation({summary: 'Create method'})
  @ApiResponse({status: 200, type: ItemsBrands})
  @Post()
  async create(
    @Body() data: CreateItemsBrandDto
  ) {
    return this.service.create(data);
  }

  @ApiOperation({summary: 'Update method'})
  @ApiResponse({status: 200, type: ItemsBrands})
  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateItemsBrandDto
  ) {
    return this.service.update(id, data)
  }

  @ApiOperation({summary: 'Delete method'})
  @ApiResponse({status: 200, type: ItemsBrands})
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.service.delete(id)
  }

  @ApiOperation({summary: 'Get by id method'})
  @ApiResponse({status: 200, type: ItemsBrands})
  @Get('/:id')
  async getById(@Param('id') id: number) {
    return this.service.getById(id);
  }

  @ApiOperation({summary: 'Get list by companyId method'})
  @ApiResponse({status: 200, type: ItemsBrands})
  @Get('/list/:companyId')
  async getAllByCountryId(@Param('companyId') companyId: number) {
    return this.service.getListByCompanyId(companyId);
  }
}
