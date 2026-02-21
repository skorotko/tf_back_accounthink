import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateItemsContactsDto } from './dto/create.dto';
import { UpdateItemsContactsDto } from './dto/update.dto';
import { ItemsContacts } from './items-contacts.model';
import { ItemsContactsService } from './items-contacts.service';

@Controller('items-contacts')
export class ItemsContactsController {
	constructor(private readonly service: ItemsContactsService) { }

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: ItemsContacts })
	@Post()
	async create(
		@Body() data: CreateItemsContactsDto
	) {
		return this.service.create(data);
	}

	@ApiOperation({ summary: 'Update method' })
	@ApiResponse({ status: 200, type: ItemsContacts })
	@Put('/:id')
	update(
		@Param('id') id: number,
		@Body() data: UpdateItemsContactsDto
	) {
		return this.service.update(id, data)
	}

	@ApiOperation({ summary: 'Delete method' })
	@ApiResponse({ status: 200, type: ItemsContacts })
	@Delete('/:id')
	delete(@Param('id') id: number) {
		return this.service.delete(id)
	}

	@ApiOperation({ summary: 'Get by id method' })
	@ApiResponse({ status: 200, type: ItemsContacts })
	@Get('/:id')
	async getById(@Param('id') id: number) {
		return this.service.getById(id);
	}

	@ApiOperation({ summary: 'Get list by companyId method' })
	@ApiResponse({ status: 200, type: ItemsContacts })
	@Get('/list/:companyId')
	async getAllByCountryId(@Param('companyId') companyId: number) {
		return this.service.getListByCompanyId(companyId);
	}
}
