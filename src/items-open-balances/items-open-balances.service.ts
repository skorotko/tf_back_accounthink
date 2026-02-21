import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { ItemsOpenBalancesDetails } from "./models/items-open-balances-details.model";
import { ItemsOpenBalancesHeader } from "./models/items-open-balances-header.model";
import { CreateItemsOBDto } from './dto/create.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionEntryService } from 'src/transaction-entry/transaction-entry.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { CreateTransactionEntryDto } from 'src/transaction-entry/dto/create-transaction-entry.dto';
import { AccountService } from 'src/account/account.service';
import { ItemsService } from 'src/items/items.service';
import { WarehouseService } from 'src/warehouse/warehouse.service';
import { ItemsTransactionType } from 'src/items/models/items-transaction.model';
import { Warehouse } from 'src/warehouse/warehouse.model';
import { Op } from "sequelize";
import { Items } from 'src/items/models/items.model';
import { ItemsUnits } from 'src/items-units/items-units.model';
import { ItemsWarehouse } from 'src/items/models/items-warehouse.model';

@Injectable()
export class ItemsOpenBalancesService {
	constructor(
		@InjectModel(ItemsOpenBalancesDetails) private itemsOBDRepository: typeof ItemsOpenBalancesDetails,
		@InjectModel(ItemsOpenBalancesHeader) private itemsOBHRepository: typeof ItemsOpenBalancesHeader,
		private transactionService: TransactionService,
		private transactionEntryService: TransactionEntryService,
		private accountService: AccountService,
		private itemsService: ItemsService,
		private warehouseService: WarehouseService
	) { }

	async generateTransactionNo(companyId): Promise<string> {
		const whereObj = { companyId, transactionCode: 'GENERAL' };
		const getLastTransaction = await this.transactionService.getLastTransaction(whereObj);
		if (!getLastTransaction)
			return "GJ1";
		let str = getLastTransaction.transactionNo.slice(2);
		let num = parseInt(str) + 1;
		str = 'GJ' + num;
		return str;
	}

	createDataDtoTr(dto: CreateItemsOBDto, transactionNo: string): CreateTransactionDto {
		return {
			transactionId: 1,
			transactionCode: 'GENERAL',
			transactionType: 'OPENING INVENTORY',
			transactionNo,
			transactionDate: dto.date,
			transactionCurrency: 'PHP',
			foreignCurrency: dto.currency,
			transactionDescription: dto.description,
			isPosted: true,
			postedDate: dto.date,
			createdBy: dto.createdBy,
			createdDate: dto.date,
			recorderBy: null,
			recorderDate: null,
			accountId: null,
			companyId: dto.companyId,
			amount: null,
			foreignAmount: null,
			exchangeRate: dto.fxRate,
			taxTypeId: null,
			reference: null
		};
	}

	async createDataDtoTrE(dto: CreateItemsOBDto, transactionId: number): Promise<CreateTransactionEntryDto[]> {
		const paymentAccount = await this.accountService.getAccountByDefaultId(56, dto.companyId);
		let trEArr = [];
		let total = 0;
		let foreignTotal = 0
		dto.itemsOBDList.forEach(obd => {
			let amount = Number((obd.costPrice * obd.qty).toFixed(8));
			let foreignAmount = Number((amount * dto.fxRate).toFixed(8));
			total += amount;
			foreignTotal += foreignTotal;
			trEArr.push({
				transactionId,
				accountId: obd.accountId,
				DRCRCode: 'DR',
				amount,
				endBalance: 0,
				description: obd.description,
				companyId: dto.companyId,
				userId: dto.createdBy,
				//entityTypeId: 2,
				entityTypeId: null,
				isAllocated: obd.vendorId === null ? 'ALLOCATED' : 'UNALLOCATED',
				vendorId: obd.vendorId,
				//entityId: 684,
				entityId: null,
				taskId: null,
				exchangeRate: dto.fxRate,
				foreignAmount,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: dto.createdBy,
				createdDate: dto.date,
				itemId: obd.itemId,
			});
		});
		trEArr.push({
			transactionId,
			accountId: paymentAccount.id,
			DRCRCode: 'CR',
			amount: total,
			endBalance: 0,
			description: dto.description,
			companyId: dto.companyId,
			userId: dto.createdBy,
			//entityTypeId: 2,
			entityTypeId: null,
			isAllocated: 'ALLOCATED',
			//entityId: 684,
			entityId: null,
			taskId: null,
			exchangeRate: dto.fxRate,
			foreignAmount: foreignTotal,
			isTax: false,
			taxAssignAccountId: null,
			createdBy: dto.createdBy,
			createdDate: dto.date
		});
		return trEArr;
	}

	async createTransaction(dto: CreateItemsOBDto): Promise<number> {
		let transactionNo = await this.generateTransactionNo(dto.companyId);
		const createDataDtoTr = this.createDataDtoTr(dto, transactionNo);
		const transaction = await this.transactionService.createTransaction(createDataDtoTr);
		const createDataDtoTrE = await this.createDataDtoTrE(dto, transaction.id);
		await this.transactionEntryService.bulkCreateTransactionEntry(createDataDtoTrE);
		return transaction.id;
	}

	createDataWarhouseInit(dto: CreateItemsOBDto): any[] {
		let dataWarInArr = [];
		dto.itemsOBDList.forEach(obd => {
			dataWarInArr.push({
				warehouseId: dto.warehouseId,
				itemId: obd.itemId,
				qty: obd.qty,
				description: dto.description,
				type: ItemsTransactionType.Initiate,
				createdBy: dto.createdBy,
				createDate: dto.date
			})
		});

		return dataWarInArr;
	}

	async createWarhouseInit(dto: CreateItemsOBDto){
		const dataWarInit: any = this.createDataWarhouseInit(dto);
		const init = await this.itemsService.warhouseInitBulk(dataWarInit);
		return init.error;
	}

	async createHeader(dto: CreateItemsOBDto, tranId: number): Promise<ItemsOpenBalancesHeader> {
		return this.itemsOBHRepository.create({ ...dto, tranId });
	}

	async bulkCreateDetails(dto: CreateItemsOBDto, itemOBHId: number): Promise<ItemsOpenBalancesDetails[]> {
		let createArr = dto.itemsOBDList.map(obj => ({ ...obj, companyId: dto.companyId, createdBy: dto.createdBy, warehouseId: dto.warehouseId, itemOBHId }));
		return this.itemsOBDRepository.bulkCreate(createArr);
	}

	async getDirectories(companyId: number, vendorListId) {
		try {
			let data = {
				itemsList: [],
				warehouseList: [],
				currencyList: []
			};
			let listOBD: any = await this.itemsOBDRepository.findAll({
				where: {
					companyId
				},
				attributes: ['id', 'companyId', 'itemId']
			});
			let itemIdArr = listOBD.map(x => x.itemId);
			if (vendorListId.length === 0)
				vendorListId = [null];
			const itemsList = await this.itemsService.getListWithFilter(companyId, null, null, null, null, [2, 3], vendorListId, itemIdArr, null);
			const warehouseList = await this.warehouseService.getListByCompanyId(companyId)
			data.itemsList = itemsList.data.map(item => {
				// console.log(item);
				return {
					itemId: item.id,
					name: item.name,
					code: item.code,
					description: item.purchaseDescription ? item.purchaseDescription : item.sellDescription,
					purchasePrice: item.purchasePrice,
					sellPrice: item.sellPrice,
					count: 1,
					unitName: item.unit.name,
					purchaseTotal: 0,
					sellTotal: 0,
					accountId: item.inventoryAssetAccountId ? item.inventoryAssetAccountId : item.purchaseAccountId,
					vendorId: item.vendorId
				}
			});
			data.warehouseList = warehouseList;

			return {
				error: false,
				data,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			return {
				error: true,
				data: null,
				message: `Failed to get items directories: ${error.message}`
			}
		}
	}

	
	async create(dto: CreateItemsOBDto) {
		try {
			const transactionId = await this.createTransaction(dto);
			if(!transactionId)
				return {
					error: true,
					data: null,
					message: `Failed to create item open balance: error create transaction`
				}
			const header = await this.createHeader(dto, transactionId);
			if (!header)
				return {
					error: true,
					data: null,
					message: `Failed to create item open balance: error create header`
				}
			const init = await this.createWarhouseInit(dto);
			if(init === true)
				return {
					error: true,
					data: null,
					message: `Failed to create item open balance: error create init`
				}
			const details = await this.bulkCreateDetails(dto, header.id);
			return {
				error: false,
				data: {
					...details
					// ...item.dataValues,
					// ...itemData.dataValues
				},
				message: 'success'
			}
		} catch (err) {
			console.error(err);
			return {
				error: true,
				data: null,
				message: `Failed to create item open balance: ${err.message}`
			}
		}
	}

	async getListWithFilter(companyId: number, startDate: string | null, endDate: string | null, page: number, warehouseId: number | null) {
		try {

			// console.log(page);

			let limit = 15;

			let offset = 0 + (page - 1) * limit;

			let objWhere: any = {
				companyId
			}

			if (warehouseId)
				objWhere.warehouseId = warehouseId;

			if (startDate && endDate){
				objWhere.date = {
					[Op.between]: [startDate, endDate]
				};
			}

			let list: any = await this.itemsOBHRepository.findAndCountAll({
				where: objWhere,
				offset,
				limit,
				order: [["date", "DESC"]],
				attributes: ['id', 'date', 'warehouseId', 'currency', 'totalAmount', 'description', 'createdBy'],
				include: [
					{
						model: Warehouse,
						attributes: ['id', 'warehouseName', 'warehouseCode']
					}
				]
			});

			// console.log(list);

			list.page = Math.ceil(list.count / limit);

			return {
				error: false,
				data: list,
				message: 'success'
			};
		} catch (error) {
			console.error(error);
			return {
				error: true,
				data: null,
				message: `Failed to get items list: ${error.message}`
			}
		}
	}

	async getById(id: number) {
		try {
			let item: any = await this.itemsOBHRepository.findOne({
				where: { id },
				attributes: ['id', 'warehouseId', 'referenceNo', 'description', 'date', 'currency', 'totalAmount'],
				include: [
					{
						model: ItemsOpenBalancesDetails,
						attributes: ['id', 'qty', 'costPrice', 'itemId', 'vendorId', 'total'],
						include: [
							{
								model: Items,
								attributes: ['id', 'name', 'code', 'purchaseDescription', 'sellDescription', 'purchasePrice', 'sellPrice', 'unitId', 'inventoryAssetAccountId', 'purchaseAccountId'],
								include: [
									{
										model: ItemsUnits,
										attributes: ['id', 'name']
									}
								]
							}
						]
					}
				]
			});
			if(item){
				item = item.get();
				item.itemsOBDList = item.itemsOBDList.map(it => {
					it = it.get();
					// console.log(it);
					it.name = it.item.name;
					it.code = it.item.code;
					it.description = it.item.purchaseDescription ? it.item.purchaseDescription : it.item.sellDescription;
					it.purchasePrice = it.item.purchasePrice;
					it.sellPrice = it.item.sellPrice;
					it.count = 1;
					it.unitName = it.item.unit.name;
					it.purchaseTotal = it.item.purchasePrice * it.qty;
					it.sellTotal = it.item.sellPrice * it.qty;
					it.accountId = it.item.inventoryAssetAccountId ? it.item.inventoryAssetAccountId : it.item.purchaseAccountId
					delete(it.item);
					return it;
				});
			}
			return {
				error: false,
				data: item,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			return {
				error: true,
				data: null,
				message: `Failed to get item: ${error.message}`
			}
		}
	}

	async delete(id: number) {

		let item = await this.itemsOBHRepository.findOne({
			where: { id },
			include: [
				{
					model: ItemsOpenBalancesDetails
				}
			]
		});

		if (!item) {
			return {
				error: true,
				data: null,
				message: 'Failed to delete OBitem: item not found'
			}
		}

		item = item.get();

		let itemIdArr = item.itemsOBDList.map(x => x.itemId);

		try {
			await this.transactionService.deleteTransaction(item.tranId);
			await this.itemsOBDRepository.destroy({
				where: {
					itemOBHId: id
				}
			});
			await this.itemsService.destroyItemWarhouse(itemIdArr);
			await this.itemsOBHRepository.destroy({
				where: {
					id
				}
			});

			return {
				error: false,
				data: null,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			return {
				error: true,
				data: null,
				message: `Failed to delete OBitem: ${error.message}`
			}
		}
	}

}
