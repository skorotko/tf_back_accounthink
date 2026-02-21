import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { Items } from "./models/items.model";
import { ItemsType } from "./models/items-type.model";
import { Account } from "../account/account.model";
import { Op } from "sequelize";
import { Group } from "../group/group.model";
import { ItemsUnitsService } from "../items-units/items-units.service";
import { ItemsUnits } from "../items-units/items-units.model";
import { ItemsGroup } from "./models/items-group.model";
import { ItemsWarehouse } from './models/items-warehouse.model';
import { ItemsTransaction, ItemsTransactionType } from './models/items-transaction.model';
import { Warehouse } from "../warehouse/warehouse.model";
import { WarehouseService } from "../warehouse/warehouse.service";

@Injectable()
export class ItemsService {
	constructor(
		@InjectModel(Items) private itemsRepository: typeof Items,
		@InjectModel(ItemsType) private itemsTypeRepository: typeof ItemsType,
		@InjectModel(ItemsGroup) private itemsGroupRepository: typeof ItemsGroup,
		@InjectModel(ItemsWarehouse) private itemsWarehouseRepository: typeof ItemsWarehouse,
		@InjectModel(ItemsTransaction) private itemsTransactionRepository: typeof ItemsTransaction,
		private readonly itemsUnitsService: ItemsUnitsService,
		private readonly warehouseService: WarehouseService,
	) {}

	async getById(id: number) {
		try {
			let item: any = await this.itemsRepository.findOne({
				where: { id },
				include: [
					ItemsType,
					ItemsUnits,
					ItemsGroup
				]
			});

			if (item.type.group === 3) {
				let childItemIdList = item.itemsGroup.map(childItem => {
					return childItem.itemId
				});
				let childItemData = await this.itemsRepository.findAll({
					where: {
						id: childItemIdList
					},
					include: [
						ItemsUnits
					]
				});
				item.dataValues.itemsGroup = item.itemsGroup.map(childItem => {
					let data = childItemData.find(x => x.id === childItem.itemId);
					return {
						itemId: data.id,
						name: data.name,
						code: data.code,
						description: data.sellDescription,
						purchasePrice: data.purchasePrice,
						sellPrice: data.sellPrice,
						count: childItem.count,
						unitName: data.unit.name,
						purchaseTotal: childItem.purchaseTotal,
						sellTotal: childItem.sellTotal
					}
				})
			}

			return  {
				error: false,
				data: item.get(),
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

	async getByCode(code: string, companyId: number, notId: number = null) {
		if (notId !== null) {
			return this.itemsRepository.findOne({
				where: {
					companyId,
					code,
					id: {
						[Op.not]: notId
					}
				}
			})
		} else {
			return this.itemsRepository.findOne({ where: { code, companyId } })
		}
	}

	async getDataForMainGroup(companyId: number, group: number = 1) {
		let groupCodes: string[] = [];
		if (group === 1) {
			groupCodes = ['5.1.2', '5.3.1']
		} else {
			groupCodes = ['1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5']
		}
		let [
			purchaseAccounts,
			purchaseTaxAccounts,
			sellAccounts,
			sellTaxAccounts
		] = await Promise.all([
			Group.findAll({
				where: {
					companyId,
					code: groupCodes,
				},
				attributes: ['id', 'entityType', 'name', 'code'],
				include: [
					{
						model: Account,
						attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
					}
				],
				order: [
					['id', 'ASC'],
					['accounts', 'code', 'ASC']
				]
			}),
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `1.1.7.1%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			}),
			Group.findAll({
				where: {
					companyId,
					[Op.or]: [
						{ code: ['4.1.1', '4.2.1'] },
						{ code: {[Op.like]: '6.1%'} }
					]
				},
				attributes: ['id', 'entityType', 'name', 'code'],
				include: [
					{
						model: Account,
						attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
					}
				],
				order: [
					['id', 'ASC'],
					['accounts', 'code', 'ASC']
				]
			}),
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `2.1.8.1%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			})
		]);

		purchaseAccounts.forEach(group => {
			group.accounts = this.addDisableFlag(group.accounts)
		});

		purchaseTaxAccounts = this.addDisableFlag(purchaseTaxAccounts);

		sellAccounts.forEach(group => {
			group.accounts = this.addDisableFlag(group.accounts)
		});

		sellTaxAccounts = this.addDisableFlag(sellTaxAccounts);

		return {
			purchaseAccounts,
			purchaseTaxAccounts,
			sellAccounts,
			sellTaxAccounts
		}
	}

	async getDataForInventoryGroup(companyId: number) {
		let [
			inventoryAccounts,
			purchaseAccounts,
			purchaseTaxAccounts,
			sellAccounts,
			sellTaxAccounts
		] = await Promise.all([
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `1.1.5%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			}),
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `5.1.1%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
			}),
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `1.1.7.1%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			}),
			Account.findAll({
				where: {
					companyId,
					[Op.or]: [
						{ code: { [Op.like]: '4.1.1%' } },
						{ code: { [Op.like]: '6.1%' } }
					]
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			}),
			Account.findAll({
				where: {
					companyId,
					code: {
						[Op.like]: `2.1.8.1%`
					}
				},
				attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId'],
				order: [['id', 'ASC']]
			})
		]);

		inventoryAccounts = this.addDisableFlag(inventoryAccounts);
		purchaseAccounts = this.addDisableFlag(purchaseAccounts);
		purchaseTaxAccounts = this.addDisableFlag(purchaseTaxAccounts);
		sellAccounts = this.addDisableFlag(sellAccounts);
		sellTaxAccounts = this.addDisableFlag(sellTaxAccounts);

		return {
			inventoryAccounts,
			purchaseAccounts,
			purchaseTaxAccounts,
			sellAccounts,
			sellTaxAccounts
		}
	}

	async getDirectories (companyId: number, typeId: number | null, companyBusinessTypeId: number) {
		try {
			let itemsType = await this.itemsTypeRepository.findAll({
				where: {
					id: {
						[Op.not]: 7
					}
				}
			});

			if (companyBusinessTypeId == 1) {
				itemsType = itemsType.filter(type => type.id !== 3 && type.id !== 4);
			} else if (companyBusinessTypeId == 2) {
				itemsType = itemsType.filter(type => type.id !== 0);
			}

			if (typeId === null) {
				return {
					error: false,
					data: { itemsType },
					message: 'success'
				}
			}

			let itemType = itemsType.find(type => type.id === typeId);

			let data: any = null;

			if (itemType.group === 1) {
				data = await this.getDataForMainGroup(companyId);
			} else if (itemType.group === 2) {
				data = await this.getDataForInventoryGroup(companyId);
			} else if (itemType.group === 3) {
				data = await this.getDataForInventoryGroup(companyId);
				data.items = await this.itemsRepository.findAll({
					where: {
						companyId,
						itemsTypeId: [0, 1, 2, 3],
						sell: true
					},
					include: [
						ItemsType,
						ItemsUnits
					]
				});
				data.items = data.items.map(item => {
					return {
						itemId: item.id,
						name: item.name,
						code: item.code,
						description: item.sellDescription,
						purchasePrice: item.purchasePrice,
						sellPrice: item.sellPrice,
						count: 1,
						unitName: item.unit.name,
						purchaseTotal: 0,
						sellTotal: 0
					}
				})
			} else if (itemType.group === 4) {
				data = await this.getDataForMainGroup(companyId, 4);
			} else {
				console.error('Error: invalid group');
				return {
					error: true,
					data: null,
					message: 'Failed get items directories: invalid group'
				}
			}

			data.units = await this.itemsUnitsService.getListByCompanyIdWithSortByName(companyId);
			data.warehouse = await this.warehouseService.getListByCompanyId(companyId);

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

	async getAllActive(companyId: number) {
		return this.getListWithFilter(companyId, null, null, null, null, null, [], [], true)
	}

	async getListWithFilter(
		companyId: number,
		name: string | null,
		typeId: number | null,
		warehouseId: number | null,
		ids: number = null,
		typeIdArr = null,
		vendorListId = [],
		itemIdArr = [],
		active = null
	) {
		try {
			let objWhere: any = {
				companyId: companyId
			}
			if (ids !== null) {
				objWhere.id = ids
			}
			if (name !== null) {
				objWhere.name = {
					[Op.like]: `%${name}%`
				}
			}
			if (typeId !== null) {
				objWhere.itemsTypeId = typeId
			}
			if (typeIdArr !== null) {
				objWhere.itemsTypeId = typeIdArr
			}
			if (vendorListId)
				if (vendorListId.length > 0) {
					objWhere.vendorId = vendorListId
				}
			if (itemIdArr)
				if(itemIdArr.length > 0) {
					objWhere.id = {
						[Op.not]: itemIdArr
					}
				}
			if (active !== null) {
				objWhere.active = active
			}

			let includeArr: any = [
				ItemsType,
				ItemsUnits,
				ItemsTransaction,
				{
					model: Account,
					as: 'inventoryAssetAccount',
					attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
				},
				{
					model: Account,
					as: 'purchaseAccount',
					attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
				},
				{
					model: Account,
					as: 'purchaseTaxAccount',
					attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
				},
				{
					model: Account,
					as: 'sellAccount',
					attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
				},
				{
					model: Account,
					as: 'sellTaxAccount',
					attributes: ['id', 'groupId', 'entityType', 'name', 'code', 'parentId']
				}
			];

			if (warehouseId === null) {
				includeArr.push(Warehouse);
			} else {
				includeArr.push({
					model: Warehouse,
					where: {
						id: warehouseId
					}
				})
			}

			let list: any = await this.itemsRepository.findAll({
				where: objWhere,
				include: includeArr,
				order: [
					['type', 'name', 'ASC'],
					['name', 'ASC']
				]
			});

			list = list.map(item => {
				item.setDataValue('obQty', item.transactions.find(tr => tr.type === ItemsTransactionType.Initiate)?.qty || 0);
				item.setDataValue('pQty', item.transactions.find(tr => tr.type === ItemsTransactionType.Buy)?.qty || 0);
				item.setDataValue('prQty', item.transactions.find(tr => tr.type === ItemsTransactionType.ReturnP)?.qty || 0);
				item.setDataValue('sQty', item.transactions.find(tr => tr.type === ItemsTransactionType.Sell)?.qty || 0);
				item.setDataValue('srQty', item.transactions.find(tr => tr.type === ItemsTransactionType.ReturnS)?.qty || 0);
				item.setDataValue('onHand', item.dataValues.obQty + item.dataValues.pQty - item.dataValues.prQty - item.dataValues.sQty + item.dataValues.srQty);
				return item
			});

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

	async create (data: any) {
		const itemWithCode = await this.getByCode(data.code, data.companyId);

		if (itemWithCode === null) {
			const transaction = await this.itemsRepository.sequelize.transaction();

			let itemsType = await this.itemsTypeRepository.findOne({
				where: {
					id: data.itemsTypeId
				}
			});

			try {
				let item: any =  await this.itemsRepository.create({
					companyId: data.companyId,
					// vendorId: data.vendorId,
					name: data.name,
					code: data.code,
					itemsTypeId: data.itemsTypeId,
					unitId: data.unitId,
					inventoryAssetAccountId: data.inventoryAssetAccountId,
					purchase: data.purchase,
					reorderQtyMin: data.reorderQtyMin,
					purchasePrice: data.purchasePrice,
					purchaseAccountId: data.purchaseAccountId,
					purchaseTaxAccountId: data.purchaseTaxAccountId,
					purchaseDescription: data.purchaseDescription,
					sell: data.sell,
					reorderQtyMax: data.reorderQtyMax,
					sellPrice: data.sellPrice,
					sellAccountId: data.sellAccountId,
					sellTaxAccountId: data.sellTaxAccountId,
					sellDescription: data.sellDescription
				}, { transaction });

				if (itemsType.group === 3) {
					let group = data.group.map(x => {
						x.parentItemId = item.id;
						return x
					});
					item.dataValues.itemsGroup = await this.itemsGroupRepository.bulkCreate(group, {
						transaction
					});
				}

				await transaction.commit();

				return  {
					error: false,
					data: item,
					message: 'success'
				}
			} catch (err) {
				console.error(err);
				await transaction.rollback();
				return {
					error: true,
					data: null,
					message: `Failed to create item: ${err.message}`
				}
			}
		} else {
			return {
				error: true,
				data: null,
				message: `Failed to create item: Item with this code already exist`
			}
		}
	}

	async update(id: number, data: any) {
		const item = await this.itemsRepository.findByPk(id);
		const itemWithCode = await this.getByCode(data.code, item.companyId, id);

		if (itemWithCode === null) {
			const transaction = await this.itemsRepository.sequelize.transaction();

			let itemsType = await this.itemsTypeRepository.findOne({
				where: {
					id: data.itemsTypeId
				}
			});

			try {
				await this.itemsRepository.update({
					name: data.name,
					code: data.code,
					itemsTypeId: data.itemsTypeId,
					unitId: data.unitId,
					inventoryAssetAccountId: data.inventoryAssetAccountId,
					purchase: data.purchase,
					reorderQtyMin: data.reorderQtyMin,
					purchasePrice: data.purchasePrice,
					purchaseAccountId: data.purchaseAccountId,
					purchaseTaxAccountId: data.purchaseTaxAccountId,
					purchaseDescription: data.purchaseDescription,
					sell: data.sell,
					reorderQtyMax: data.reorderQtyMax,
					sellPrice: data.sellPrice,
					sellAccountId: data.sellAccountId,
					sellTaxAccountId: data.sellTaxAccountId,
					sellDescription: data.sellDescription
				}, {
					where: {
						id
					},
					transaction: transaction
				});

				if (itemsType.group === 3) {
					await this.deleteItemsGroupByParentItemId(id, transaction);
					data.group = data.group.map(item => {
						item.parentItemId = id;
						return item
					});
					await this.itemsGroupRepository.bulkCreate(data.group, {
						transaction
					});
				}

				await transaction.commit();

				return {
					error: false,
					data: null,
					message: 'success'
				}
			} catch (error) {
				console.error(error);
				await transaction.rollback();
				return {
					error: true,
					data: null,
					message: `Failed to update item: ${error.message}`
				};
			}
		} else {
			return {
				error: true,
				data: null,
				message: `Failed to create item: Item with this code already exist`
			}
		}
	}

	async updateStatus(id: number, status: boolean) {
		await this.itemsRepository.update({
			active: status
		}, {
			where: {
				id
			}
		});
	}

	async delete(id: number) {
		const transaction = await this.itemsRepository.sequelize.transaction();

		let item = await this.itemsRepository.findOne({
			where: { id },
			include: [
				ItemsType,
				ItemsTransaction
			]
		});

		if (!item) {
			return {
				error: true,
				data: null,
				message: 'Failed to delete item: item not found'
			}
		}

		if (item.transactions.length > 0) {
			return {
				error: true,
				data: null,
				message: 'Failed to delete item: item have transactions'
			}
		}

		try {
			await this.itemsRepository.destroy( {
				where: {
					id
				},
				transaction: transaction
			});

			if (item.type.group === 3) {
				await this.deleteItemsGroupByParentItemId(id, transaction);
			}

			await transaction.commit();

			return {
				error: false,
				data: null,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			await transaction.rollback();
			return {
				error: true,
				data: null,
				message: `Failed to delete item: ${error.message}`
			}
		}
	}

	async deleteItemsGroupByParentItemId(id: number, transaction) {
		return await this.itemsGroupRepository.destroy({
			where: {
				parentItemId: id
			},
			transaction
		});
	}

	async deleteAllItemsForCompany (companyId: number) {
		let items = await this.itemsRepository.findAll({
			where: { companyId },
			include: [
				ItemsType
			]
		});

		let ids = items.map(item => item.id);

		const transaction = await this.itemsRepository.sequelize.transaction();

		try {
			await this.itemsTransactionRepository.destroy({
				where: {
					itemId: ids,
				},
				individualHooks: true,
				transaction: transaction,
			});

			await this.itemsWarehouseRepository.destroy({
				where: {
					itemId: ids
				},
				transaction: transaction
			});

			await this.itemsGroupRepository.destroy({
				where: {
					parentItemId: ids
				},
				transaction: transaction
			});

			await this.itemsRepository.destroy({
				where: {
					companyId
				},
				transaction: transaction
			});

			await transaction.commit();

			return {
				error: false,
				data: null,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			await transaction.rollback();
			return {
				error: true,
				data: null,
				message: `Failed to clean company items: ${error.message}`
			}
		}
	}

	addDisableFlag (list: any) {
		const parentIds = {};

		list.forEach(item => {
			if (item.parentId !== null) {
				parentIds[item.parentId] = true;
			}
		});

		list.forEach(item => {
			item.dataValues.disable = parentIds.hasOwnProperty(item.id) || false;
		});
		return list
	}

	async warhouseInitBulk(itemArr: []){
		try {
			await this.itemsWarehouseRepository.bulkCreate(itemArr, { updateOnDuplicate: ["itemId"]});
			await this.itemsTransactionRepository.bulkCreate(itemArr);
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
				message: `Failed to update item: ${error.message}`
			};
		}
	}

	async getAllWarehouseItems(companyId: number, warehouseId: number | null) {
		try {
			let objWarehouseWhere: any = {
				companyId: companyId
			};

			if (warehouseId !== null) {
				objWarehouseWhere.id = warehouseId
			}

			let warehouseItems = await this.itemsWarehouseRepository.findAll({
				include: [
					{
						model: Items,
						where: {
							companyId
						},
						include: [
							ItemsType,
							ItemsUnits,
							ItemsTransaction
						]
					},
					{
						model: Warehouse,
						where: objWarehouseWhere
					}
				]
			});

			let list = warehouseItems.map(warehouseItems => {
				let obQty = warehouseItems.item.transactions.find(tr => tr.type === ItemsTransactionType.Initiate)?.qty || 0;
				let	pQty = warehouseItems.item.transactions.find(tr => tr.type === ItemsTransactionType.Buy)?.qty || 0;
				let	prQty = warehouseItems.item.transactions.find(tr => tr.type === ItemsTransactionType.ReturnP)?.qty || 0;
				let	sQty = warehouseItems.item.transactions.find(tr => tr.type === ItemsTransactionType.Sell)?.qty || 0;
				let	srQty = warehouseItems.item.transactions.find(tr => tr.type === ItemsTransactionType.ReturnS)?.qty || 0;
				let onHand = obQty + pQty - prQty - sQty + srQty;
				return {
					companyId: warehouseItems.item.companyId,
					warehouseId: warehouseItems.warehouseId,
					warehouseCode: warehouseItems.warehouse.warehouseCode,
					warehouseName: warehouseItems.warehouse.warehouseName,
					warehouseItemQty: onHand,
					itemId: warehouseItems.itemId,
					itemTypeId: warehouseItems.item.itemsTypeId,
					type: warehouseItems.item.type,
					unitId: warehouseItems.item.unitId,
					unit: warehouseItems.item.unit,
					code: warehouseItems.item.code,
					name: warehouseItems.item.name,
					purchasePrice: warehouseItems.item.purchasePrice,
					purchaseDescription: warehouseItems.item.purchaseDescription,
					sellPrice: warehouseItems.item.sellPrice,
					sellDescription: warehouseItems.item.sellDescription,
					obQty,
					pQty,
					prQty,
					sQty,
					srQty,
					onHand
				}
			})

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
				message: `Failed to get items warehouse list: ${error.message}`
			}
		}
	}

	async clearCompanyItemsTransactions(companyId: number) {
		const transaction = await this.itemsRepository.sequelize.transaction();

		try {
			let companyItems = await this.itemsRepository.findAll({
				where: {
					companyId
				}
			});

			let companyIdItemsArr = companyItems.map(item => {
				return item.id
			});

			await this.itemsTransactionRepository.destroy( {
				where: {
					itemId: companyIdItemsArr
				},
				individualHooks: true,
				transaction: transaction
			});

			await transaction.commit();

			return {
				error: false,
				data: null,
				message: 'success'
			}
		} catch (error) {
			console.error(error);
			await transaction.rollback();
			return {
				error: true,
				data: null,
				message: `Failed to delete item transactions to company: ${error.message}`
			}
		}
	}

	async destroyItemWarhouse(itemIdArr){
		try {

			await this.itemsWarehouseRepository.destroy({
				where: {
					itemId: itemIdArr
				}
			})

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
