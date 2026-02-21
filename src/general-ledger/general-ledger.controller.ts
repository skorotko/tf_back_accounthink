import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeneralLedgerService } from './general-ledger.service';

@Controller('general-ledger')
export class GeneralLedgerController {
	constructor(private generalLedgerService: GeneralLedgerService) { }

	@ApiOperation({ summary: 'Get details GL all accounts  by companyId' })
	@ApiResponse({ status: 200})
	@Get('/detailsBeginBalance/:companyId/:startDate/:endDate/:filterEntityTypeId/:filterEntity')
	getArrBeginBalanceForCompanyId( 
		@Param() params: {
			companyId: number,
			startDate: string,
			endDate: string,
			filterEntityTypeId: string,
			filterEntity: string
		}
	) {
		return this.generalLedgerService.getArrBeginBalanceForCompanyId(params);
	}

	@ApiOperation({ summary: 'Get details GL all accounts  by companyId' })
	@ApiResponse({ status: 200 })
	@Get('/detailsExport/:companyId/:startDate/:endDate/:filterEntityTypeId/:filterEntity')
	getDetailsExport(
		@Param() params: {
			companyId: number,
			startDate: string,
			endDate: string,
			filterEntityTypeId: string,
			filterEntity: string
		}
	) {
		return this.generalLedgerService.getDetailsExport(params);
	}

	@ApiOperation({ summary: 'Get details GL all accounts  by companyId' })
	@ApiResponse({ status: 200 })
	@Get('/detailsTE/:companyId/:accountId/:startDate/:endDate')
	getTEDetailsForAccId(
		@Param() params: {
			companyId: number,
			accountId: number,
			startDate: string,
			endDate: string
		}
	) {
		return this.generalLedgerService.getTEDetailsForAccId(params);
	}

	@ApiOperation({ summary: 'Get details GL all accounts  by companyId' })
	@ApiResponse({ status: 200 })
	@Get('/getFilterData/:companyId/:startDate/:endDate')
	getFilterData(
		@Param() params: {
			companyId: number,
			startDate: string,
			endDate: string
		}
	) {
		return this.generalLedgerService.getFilterData(params);
	}

	@ApiOperation({})
	@ApiResponse({})
	@Get('/organisation/:companyId/:accountId/:filterBy/:id')
	getOrganisation(
		@Param() params: {
			companyId: number,
			accountId: number,
			filterBy: string
			id: number
		}
	) {
		return this.generalLedgerService.getOrganisation(
			params.companyId,
			params.accountId,
			params.filterBy,
			params.id
		)
	}
}
