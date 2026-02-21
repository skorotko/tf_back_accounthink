import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ItemsService } from "./items.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Items } from "./models/items.model";

@Controller('items')
export class ItemsController {

	constructor(private itemsService: ItemsService) {}

	@ApiOperation({summary: 'Get items directories'})
	@ApiResponse({status: 200, type: Items})
	@Get("directories/:companyId/:typeId/:companyBusinessTypeId")
	getDirectories(
		@Param() params: {
			companyId: number,
			typeId: any,
			companyBusinessTypeId: number
		}
	) {
		params.typeId = params.typeId === 'null' || params.typeId === null  ? null : parseInt(params.typeId);
		return this.itemsService.getDirectories(params.companyId, params.typeId, params.companyBusinessTypeId)
	}

	@ApiOperation({summary: 'Get item'})
	@ApiResponse({status: 200, type: Items})
	@Get("/:id")
	getOneById(
		@Param('id') id: number
	) {
		return this.itemsService.getById(id)
	}

	@ApiOperation({summary: 'Get items list'})
	@ApiResponse({status: 200, type: Items})
	@Get("list/:companyId/:name/:typeId/:warehouseId")
	getAll(
		@Param() params: {
			companyId: number;
			name: any;
			typeId: any;
			warehouseId: any;
		}
	) {
		params.name = params.name === 'null' || params.name === null  ? null : params.name;
		params.typeId = params.typeId === 'null' || params.typeId === null  ? null : parseInt(params.typeId);
		params.warehouseId = params.warehouseId === 'null' || params.warehouseId === null  ? null : parseInt(params.warehouseId);
		return this.itemsService.getListWithFilter(params.companyId, params.name, params.typeId, params.warehouseId, null, null, null)
	}

	@ApiOperation({summary: 'Get items list'})
	@ApiResponse({status: 200, type: Items})
	@Get("active-list/:companyId")
	getAllActive(
		@Param() params: {
			companyId: number;
		}
	) {
		return this.itemsService.getAllActive(params.companyId)
	}

	@ApiOperation({summary: 'Get items list'})
	@ApiResponse({status: 200, type: Items})
	@Get("items-warehouse/list/:companyId/:warehouseId")
	getAllItemsWarehouse(
		@Param() params: {
			companyId: number;
			warehouseId: any;
		}
	) {
		params.warehouseId = params.warehouseId === 'null' || params.warehouseId === null  ? null : parseInt(params.warehouseId);
		return this.itemsService.getAllWarehouseItems(params.companyId, params.warehouseId)
	}

	@ApiOperation({summary: 'Create item'})
	@ApiResponse({status: 200, type: Items})
	@Post()
	create(
		@Body() data: any
	) {
		return this.itemsService.create(data)
	}

	@ApiOperation({summary: 'Update item'})
	@ApiResponse({status: 200, type: Items})
	@Put("/:id")
	update(
		@Param('id') id: number,
		@Body() data: any
	) {
		return this.itemsService.update(id, data)
	}

	@ApiOperation({summary: 'Update item status'})
	@ApiResponse({status: 200, type: Items})
	@Put("/status/:id")
	updateStatus(
		@Param('id') id: number,
		@Body() data: {
			status: boolean
		}
	) {
		return this.itemsService.updateStatus(id, data.status)
	}

	@ApiOperation({summary: 'Delete item'})
	@ApiResponse({status: 200, type: Items})
	@Delete("/:id")
	delete(
		@Param('id') id: number
	) {
		return this.itemsService.delete(id)
	}

	@ApiOperation({summary: 'Delete all company items'})
	@ApiResponse({status: 200, type: Items})
	@Delete("company/:companyId")
	deleteAllForCompany(
		@Param('companyId') companyId: number
	) {
		return this.itemsService.deleteAllItemsForCompany(companyId)
	}

	@ApiOperation({summary: 'Delete all items transactions by companyId'})
	@ApiResponse({status: 200, type: Items})
	@Delete("items-transactions/:companyId")
	clearCompanyItemsTransactions(
		@Param('companyId') companyId: number
	) {
		return this.itemsService.clearCompanyItemsTransactions(companyId)
	}
}
