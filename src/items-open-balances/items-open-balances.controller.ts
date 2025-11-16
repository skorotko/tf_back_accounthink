import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ItemsOpenBalancesService } from "./items-open-balances.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ItemsOpenBalancesDetails } from './models/items-open-balances-details.model';
import { CreateItemsOBDto } from './dto/create.dto';
import { ItemsOpenBalancesHeader } from './models/items-open-balances-header.model';

@Controller('items-open-balances')
export class ItemsOpenBalancesController {

	constructor(private itemsOBService: ItemsOpenBalancesService) { }

	@ApiOperation({ summary: 'Get items open balance directories' })
	@ApiResponse({ status: 200, type: Object })
	@Post("directories/:companyId")
	getDirectories(
		@Param() params: {
			companyId: number
		},
		@Body() body: {vendorListId: []}
	) {
		return this.itemsOBService.getDirectories(params.companyId, body.vendorListId);
	}

	@ApiOperation({ summary: 'Get item' })
	@ApiResponse({ status: 200, type: ItemsOpenBalancesHeader })
	@Get("/:id")
	getOneById(
		@Param('id') id: number
	) {
		return this.itemsOBService.getById(id)
	}

	@ApiOperation({ summary: 'Get items list' })
	@ApiResponse({ status: 200, type: ItemsOpenBalancesHeader })
	@Get("list/:companyId/:warehouseId/:page/:startDate/:endDate")
	getAll(
		@Param() params: {
			companyId: number;
			startDate: string;
			endDate: string;
			page: string;
			warehouseId: any;
		}
	) {
		params.startDate = params.startDate === 'null' || params.startDate === null ? null : params.startDate;
		params.endDate = params.endDate === 'null' || params.endDate === null ? null : params.endDate;
		params.warehouseId = params.warehouseId === 'null' || params.warehouseId === null ? null : parseInt(params.warehouseId);
		return this.itemsOBService.getListWithFilter(params.companyId, params.startDate, params.endDate, parseInt(params.page), params.warehouseId)
	}

	@ApiOperation({ summary: 'Create items open balance' })
	@ApiResponse({ status: 200, type: ItemsOpenBalancesDetails })
	@Post()
	create(@Body() dto: CreateItemsOBDto) {
		return this.itemsOBService.create(dto)
	}

	// @ApiOperation({ summary: 'Update item' })
	// @ApiResponse({ status: 200, type: Items })
	// @Put("/:id")
	// update(
	// 	@Param('id') id: number,
	// 	@Body() data: any
	// ) {
	// 	return this.itemsService.update(id, data)
	// }

	@ApiOperation({ summary: 'Delete item' })
	@ApiResponse({ status: 200, type: ItemsOpenBalancesDetails })
	@Delete("/:id")
	delete(
		@Param('id') id: number
	) {
		return this.itemsOBService.delete(id)
	}

	// @ApiOperation({ summary: 'Delete all company items' })
	// @ApiResponse({ status: 200, type: Items })
	// @Delete("company/:companyId")
	// deleteAllForCompany(
	// 	@Param('companyId') companyId: number
	// ) {
	// 	return this.itemsService.deleteAllItemsForCompany(companyId)
	// }
}
