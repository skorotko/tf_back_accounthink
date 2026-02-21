import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryGroupDto } from './dto/create.dto';
import { UpdateCategoryGroupDto } from './dto/update.dto';
import { ItemsCategoryGroup } from './items-category-group.model';
import { ItemsCategoryGroupService } from './items-category-group.service';

@Controller('items-category-group')
export class ItemsCategoryGroupController {
	constructor(
		private readonly service: ItemsCategoryGroupService
	) { }


	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: ItemsCategoryGroup })
	@Post()
	create(
		@Body() data: CreateCategoryGroupDto
	) {
		return this.service.create(data);
	}

	@ApiOperation({ summary: 'Update method' })
	@ApiResponse({ status: 200, type: ItemsCategoryGroup })
	@Put('/:id')
	update(
		@Param('id') id: number,
		@Body() data: UpdateCategoryGroupDto
	) {
		return this.service.update(id, data)
	}

	@ApiOperation({ summary: 'Delete method' })
	@ApiResponse({ status: 200, type: ItemsCategoryGroup })
	@Delete('/:id')
	delete(@Param('id') id: number) {
		return this.service.delete(id)
	}

	@ApiOperation({ summary: 'Get by id method' })
	@ApiResponse({ status: 200, type: ItemsCategoryGroup })
	@Get('/:id')
	getById(@Param('id') id: number) {
		return this.service.getById(id);
	}

	@ApiOperation({ summary: 'Get list by companyId method' })
	@ApiResponse({ status: 200, type: ItemsCategoryGroup })
	@Get('/list/:companyId')
	getAllByCountryId(@Param('companyId') companyId: number) {
		return this.service.getListByCompanyId(companyId);
	}
}
