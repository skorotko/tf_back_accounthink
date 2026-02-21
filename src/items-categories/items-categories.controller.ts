import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoriesDto } from './dto/create.dto';
import { UpdateCategoriesDto } from './dto/update.dto';
import { ItemsCategories } from './items-categories.model';
import { ItemsCategoriesService } from './items-categories.service';

@Controller('items-categories')
export class ItemsCategoriesController {
	constructor(
		private readonly service: ItemsCategoriesService
	) { }


	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: ItemsCategories })
	@Post()
	create(
		@Body() data: CreateCategoriesDto
	) {
		return this.service.create(data);
	}

	@ApiOperation({ summary: 'Update method' })
	@ApiResponse({ status: 200, type: ItemsCategories })
	@Put('/:id')
	update(
		@Param('id') id: number,
		@Body() data: UpdateCategoriesDto
	) {
		return this.service.update(id, data)
	}

	@ApiOperation({ summary: 'Delete method' })
	@ApiResponse({ status: 200, type: ItemsCategories })
	@Delete('/:id')
	delete(@Param('id') id: number) {
		return this.service.delete(id)
	}

	@ApiOperation({ summary: 'Get by id method' })
	@ApiResponse({ status: 200, type: ItemsCategories })
	@Get('/:id')
	getById(@Param('id') id: number) {
		return this.service.getById(id);
	}

	@ApiOperation({ summary: 'Get list by companyId method' })
	@ApiResponse({ status: 200, type: ItemsCategories })
	@Get('/list/:companyId/:groupId')
	getAllByCountryId(@Param() params: {
		companyId: number,
		groupId: number
	}) {
		return this.service.getListByCompanyId(params.companyId, params.groupId);
	}
}
