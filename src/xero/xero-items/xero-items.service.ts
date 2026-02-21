import { Injectable } from '@nestjs/common';
import { Items } from 'xero-node';
import { CreateXeroItemsDto } from '../dto/CreateXeroItemsDto';

@Injectable()
export class XeroItemsService {

	async get (xero, id) {
		return await xero.accountingApi.getItem('', id);
	}

	async getList(xero) {
		return await xero.accountingApi.getItems('');
	}

	async create(xero, dto: CreateXeroItemsDto) {
		const newItems: Items = new Items();
		newItems.items = [dto];
		return await xero.accountingApi.createItems('', newItems);
	}

	async update(xero, dto: CreateXeroItemsDto, id) {
		const items: Items = { items: [dto] };
		return await xero.accountingApi.updateItem('', id, items);
	}

	async delete(xero, id) {
		await xero.accountingApi.deleteItem('', id);
	}
}
