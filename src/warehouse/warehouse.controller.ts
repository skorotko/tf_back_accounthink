import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WarehouseService } from "./warehouse.service";
import { Warehouse } from "./warehouse.model";
import { WarehouseDataDto } from "./dto/warehouse-data.dto";

@Controller('warehouse')
export class WarehouseController {

  constructor(private warehouseService: WarehouseService) {}

  @ApiOperation({summary: 'Get warehouse list'})
  @ApiResponse({status: 200, type: Warehouse})
  @Get("list/:companyId")
  getAll(
    @Param("companyId") companyId: number
  ) {
    return this.warehouseService.getListByCompanyId(companyId)
  }

  @ApiOperation({summary: 'Get warehouse list by business unit'})
  @ApiResponse({status: 200, type: Warehouse})
  @Get("bu/:buId")
  getAllByBusinessUnit(
    @Param("buId") buId: number
  ) {
    return this.warehouseService.getListByBusinessUnitId(buId)
  }

  @ApiOperation({summary: 'Get warehouse list with items'})
  @ApiResponse({status: 200, type: Warehouse})
  @Get("items/list/:companyId/:id")
  getAllWithItems(
    @Param() params: {
      companyId: number,
      id: any
    }
  ) {
    params.id = params.id === 'null' || params.id === null  ? null : parseInt(params.id);
    return this.warehouseService.getListByCompanyIdWithItems(params.companyId, params.id)
  }

  @ApiOperation({summary: 'Get warehouse item'})
  @ApiResponse({status: 200, type: Warehouse})
  @Get("/:id")
  getOne(
    @Param("id") id: number
  ) {
    return this.warehouseService.getById(id)
  }

  @ApiOperation({summary: 'Create warehouse item'})
  @ApiResponse({status: 200, type: Warehouse})
  @Post()
  create(
    @Body() data: WarehouseDataDto
  ) {
    return this.warehouseService.create(data)
  }

  @ApiOperation({summary: 'Update warehouse item'})
  @ApiResponse({status: 200, type: Warehouse})
  @Put("/:id")
  update(
    @Param('id') id: number,
    @Body() data: WarehouseDataDto
  ) {
    return this.warehouseService.update(id, data)
  }

  @ApiOperation({summary: 'Update warehouse item'})
  @ApiResponse({status: 200, type: Warehouse})
  @Delete("/:id")
  delete(
    @Param('id') id: number
  ) {
    return this.warehouseService.delete(id)
  }

  @ApiOperation({summary: 'Delete all company warehouse'})
  @ApiResponse({status: 200, type: Warehouse})
  @Delete("company/:companyId")
  deleteAllForCompany(
    @Param('companyId') companyId: number
  ) {
    return this.warehouseService.deleteAllForCompany(companyId)
  }
}
