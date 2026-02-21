import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BankAccountType } from './bank-account-type.model';
import { BankAccountTypeService } from './bank-account-type.service';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto';

@ApiTags('Bank Accounts Type')
@Controller('bank-account-type')
export class BankAccountTypeController {
	constructor(private bankAccountTypeService: BankAccountTypeService) { }

	@ApiOperation({ summary: 'Create bank account type method' })
	@ApiResponse({ status: 200, type: BankAccountType })
	@Post('/:companyId')
	create(@Param('companyId') companyId: number, @Body() bankAccountTypeDto: CreateBankAccountTypeDto) {
		return this.bankAccountTypeService.create(companyId, bankAccountTypeDto)
	}

	@ApiOperation({ summary: 'Update bank account type method' })
	@ApiResponse({ status: 200, type: BankAccountType })
	@Put('/:id')
	update(@Param('id') id: number, @Body() bankAccountTypeDto: UpdateBankAccountTypeDto) {
		return this.bankAccountTypeService.update(id, bankAccountTypeDto)
	}

	@ApiOperation({ summary: 'Get list bank account type' })
	@ApiResponse({ status: 200, type: BankAccountType })
	@Get('/:companyId')
	getList(@Param('companyId') companyId: number) {
		return this.bankAccountTypeService.getList(companyId)
	}

	@ApiOperation({ summary: 'Get item bank account type' })
	@ApiResponse({ status: 200, type: BankAccountType })
	@Get('/item/:id')
	getItem(@Param('id') id: number) {
		return this.bankAccountTypeService.getItem(id)
	}

	@ApiOperation({ summary: 'Delete bank account type' })
	@ApiResponse({ status: 200, type: BankAccountType })
	@Delete('/item/:id')
	delete(@Param('id') id: number) {
		return this.bankAccountTypeService.delete(id)
	}
}
