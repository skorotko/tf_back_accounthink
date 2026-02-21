import { Injectable } from '@nestjs/common';

@Injectable()
export class XeroTaxRatesService {
	async getList(xero) {
		return await xero.accountingApi.getTaxRates('');
	}
}
