import { Injectable } from '@nestjs/common';

@Injectable()
export class XeroAccountsService {
	async getList(xero) {
		return await xero.accountingApi.getAccounts('');
	}
}
