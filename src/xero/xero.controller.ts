import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateXeroDto } from './dto/CreateXeroDto';
import { Xero } from './xero.model';
import { XeroService } from './xero.service';
import { XeroDec } from './xero.decorator';
import { CreateXeroItemsDto } from './dto/CreateXeroItemsDto';
import { XeroItemsService } from './xero-items/xero-items.service';
import { XeroTaxRatesService } from './xero-taxrates/xero-taxRates.service';
import { XeroAccountsService } from './xero-accounts/xero-accounts.service';
import { XeroContactsService } from './xero-contacts/xero-contacts.service';
import {CreateXeroContactsDto} from "./xero-contacts/dto/create.dto";

@Controller('xero')
export class XeroController {
	constructor(
		private readonly xeroService: XeroService,
		private readonly xeroItmesService: XeroItemsService,
		private readonly xeroTaxRatesService: XeroTaxRatesService,
		private readonly xeroAccountsService: XeroAccountsService,
		private readonly xeroContactsService: XeroContactsService
	) { }

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Post()
	async create(@Body() dto: CreateXeroDto) {
		return this.xeroService.create(dto);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Post('items/:companyId')
	async createItems(@XeroDec() xero: Xero , @Body() dto: CreateXeroItemsDto) {
		return this.xeroItmesService.create(xero, dto);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('items/:companyId')
	async getListItems(@XeroDec() xero: Xero) {
		return this.xeroItmesService.getList(xero);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Put('items/:companyId/:id')
	async updateItems(@XeroDec() xero: Xero, @Body() dto: CreateXeroItemsDto, @Param() params: {
		companyId: number,
		id: string
	}) {
		return this.xeroItmesService.update(xero, dto, params.id);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Delete('items/:companyId/:id')
	async deleteItems(@XeroDec() xero: Xero, @Param() params: {
		companyId: number,
		id: string
	}) {
		return this.xeroItmesService.delete(xero, params.id);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('accounts/:companyId')
	async getAccounts(@XeroDec() xero: Xero) {
		return this.xeroAccountsService.getList(xero);
	}

	@ApiOperation({ summary: 'Get directories method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('contacts/directories/:companyId')
	async getDirectories(@XeroDec() xero: Xero) {
		return this.xeroContactsService.getDirectories(xero);
	}

	@ApiOperation({ summary: 'Get list method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('contacts/list/:companyId')
	async getContacts(@XeroDec() xero: Xero) {
		return this.xeroContactsService.getList(xero);
	}

	@ApiOperation({ summary: 'Get item method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('contacts/:companyId/:id')
	async getContactsItem(
		@XeroDec() xero: Xero,
		@Param() params: {
			companyId: number,
			id: string
		}
	) {
		return this.xeroContactsService.get(xero, params.id);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Post('contacts/:companyId')
	async createContacts(@XeroDec() xero: Xero , @Body() data: CreateXeroContactsDto) {
		return this.xeroContactsService.create(xero, data);
	}

	@ApiOperation({ summary: 'Update method' })
	@ApiResponse({ status: 200, type: Xero })
	@Put('contacts/:companyId/:id')
	async updateContacts(
		@XeroDec() xero: Xero,
		@Body() data: CreateXeroContactsDto,
		@Param() params: {
			companyId: number,
			id: string
		}
	) {
		return this.xeroContactsService.update(xero, params.id, data);
	}

	@ApiOperation({ summary: 'Create method' })
	@ApiResponse({ status: 200, type: Xero })
	@Get('taxRates/:companyId')
	async getTaxRates(@XeroDec() xero: Xero) {
		return this.xeroTaxRatesService.getList(xero);
	}

	// @ApiOperation({ summary: 'Create method' })
	// @ApiResponse({ status: 200, type: Xero })
	// @Post('/acc/:companyId')
	// async acc(@XeroDec() xero: Xero) {
	// 	return this.xeroService.getAcc(xero);
	// }
}
