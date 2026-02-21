import { Injectable } from '@nestjs/common';
import { CashReceiptHeaderModel } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.model';
import { CashReceiptHeaderService } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.service';
import { CreateTransactionEntryDto } from 'src/transaction-entry/dto/create-transaction-entry.dto';
import { TransactionEntryService } from 'src/transaction-entry/transaction-entry.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { CashReceiptDetailsService } from './cash-receipt-details/cash-receipt-details.service';
import { v4 as uuidv4 } from 'uuid';
import { AccountService } from 'src/account/account.service';
import { ItemsTransactionType } from 'src/items/models/items-transaction.model';
import { ItemsService } from 'src/items/items.service';



//export interface CashReceiptService extends CashReceiptHeaderService { }
@Injectable()
export class CashReceiptService {
	constructor(private transactionService: TransactionService,
		private transactionEntryService: TransactionEntryService,
		private cashReceiptHeaderService: CashReceiptHeaderService,
		private cashReceiptDetailsService: CashReceiptDetailsService,
		private accountService: AccountService,
		private readonly itemsService: ItemsService,
	) { }


	incrementLetter(str) {
		let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let lastLetterFirst = str.charAt(0);
		let lastLetterSecond = str.charAt(1);
		if (lastLetterSecond === "Z") {
			return letters.charAt(letters.indexOf(lastLetterFirst) + 1) + "A000001";
		} else {
			let nextLetter = letters.charAt(letters.indexOf(lastLetterSecond) + 1);
			return lastLetterFirst + nextLetter + "000001";
		}
	}

	async generateTransactionNo(companyId): Promise<string> {
		const whereObj = { companyId, transactionCode: 'CASHRECEIPT' };
		const getLastTransaction = await this.transactionService.getLastTransaction(whereObj);
		if (!getLastTransaction)
			return "CR-AA000001";
		let str = getLastTransaction.transactionNo.slice(3);
		let num = parseInt(str.slice(2));
		if (num >= 999999) {
			str = this.incrementLetter(str);
			num = 1;
		} else {
			num++;
		}
		str = 'CR-' + str.slice(0, 2) + num.toString().padStart(6, "0");
		return str;
	}

	createDataDtoTr(cashReceiptObj: CashReceiptHeaderModel, transactionNo: string): CreateTransactionDto {
		return {
			transactionId: 1,
			transactionCode: 'CASHRECEIPT',
			transactionType: 'CASHRECEIPT',
			transactionNo,
			transactionDate: cashReceiptObj.crDate,
			transactionCurrency: 'PHP',
			foreignCurrency: cashReceiptObj.clientCurrency,
			transactionDescription: cashReceiptObj.sellingNotes,
			isPosted: true,
			postedDate: cashReceiptObj.crDate,
			createdBy: cashReceiptObj.cashReceiptPayments[0].createdBy,
			createdDate: cashReceiptObj.crDate,
			recorderBy: null,
			recorderDate: null,
			accountId: null,
			companyId: cashReceiptObj.companyId,
			amount: null,
			foreignAmount: null,
			exchangeRate: cashReceiptObj.fxRate,
			taxTypeId: cashReceiptObj.amountsAre,
			reference: null
		};
	}

	async createDataDtoTrE(cashReceiptObj: CashReceiptHeaderModel, transactionId: number, countryId: number): Promise<CreateTransactionEntryDto[]> {
		const cashReceiptPayments = cashReceiptObj.cashReceiptPayments;
		const cashReceiptDetails = cashReceiptObj.cashReceiptDetails;
		const paymentAccount = await this.accountService.getAccountByDefaultId(41, cashReceiptObj.companyId);
		const exchangeAccount = await this.accountService.getAccountByDefaultId(115, cashReceiptObj.companyId);
		const noTax : any = await this.accountService.getNoTaxAccount(cashReceiptObj.companyId, countryId, 1);
		let noTaxId = 0;
		if (noTax.length > 0)
			if(noTax[0])
				noTaxId = noTax[0].id;
		let trEArr = [];
		let VatRCheked = false;
		cashReceiptPayments.forEach(crp => {
			let amount = Number((cashReceiptObj.fxRate * crp.amountReceived).toFixed(8));
			let foreignAmount = crp.amountReceived;
			if (cashReceiptObj.clientCurrency !== cashReceiptObj.paymentCurrency) {
				amount = crp.amountReceived;
				foreignAmount = Number((crp.amountReceived / cashReceiptObj.fxRate).toFixed(8));
			}
			let dataDtoTrE = {
				transactionId,
				accountId: crp.depositAccountId,
				DRCRCode: 'DR',
				amount,
				endBalance: 0,
				description: cashReceiptObj.sellingNotes,
				companyId: cashReceiptObj.companyId,
				userId: crp.createdBy,
				//entityTypeId: 2,
				entityTypeId: null,
				isAllocated: 'ALLOCATED',
				clientId: cashReceiptObj.clientId,
				//entityId: 684,
				VatRCheked,
				VatRCleared: false,
				VatRCheckedDate: cashReceiptObj.createDate, //test
				VatRCheckedBy: cashReceiptObj.createdBy,
				entityId: null,
				taskId: null,
				exchangeRate: cashReceiptObj.fxRate,
				foreignAmount,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: crp.createdBy,
				createdDate: crp.createDate
			}
			trEArr.push(dataDtoTrE);
		});
		cashReceiptDetails.forEach(crd => {
			if (cashReceiptObj.isVatWHTax && !cashReceiptObj.isVatWHTaxToggle && crd.taxRate === 0 && crd.totalAmount === 0)
				return
			// if(crd.notaxAmount)
			// 	if(crd.notaxAmount > 0)
			// 		VatRCheked = false;
			let amount = crd.totalAmount;
			let foreignAmount = crd.totalAmount;
			if (crd.vatableAmount !== 0) {
				amount = crd.vatableAmount;
				foreignAmount = crd.vatableAmount;
			}
			let code = uuidv4();
			let DRCRCode = 'DR';
			if (!crd.isClientWHTax)
				DRCRCode = 'CR';
			if (crd.discountAccountId)
				DRCRCode = 'DR';
			if (crd.accountId !== crd.taxCodeId) {
				VatRCheked = false;
				trEArr.push({
					transactionId,
					accountId: crd.accountId,
					DRCRCode,
					amount: Number(Number(cashReceiptObj.fxRate * amount).toFixed(8)),
					endBalance: 0,
					description: crd.details,
					companyId: cashReceiptObj.companyId,
					userId: crd.createdBy,
					entityTypeId: crd.allocatedTo,
					isAllocated: 'ALLOCATED',
					clientId: cashReceiptObj.clientId,
					buId: crd.buId,
					itemId: crd.itemId,
					VatRCheked,
					VatRCleared: false,
					VatRCheckedDate: crd.createDate,
					VatRCheckedBy: crd.createdBy, //test
					VatRApplicableMonth: null,
					entityId: crd.euId,
					taskId: crd.taskId,
					exchangeRate: cashReceiptObj.fxRate,
					foreignAmount,
					isTax: false,
					taxAssignAccountId: null,
					trAccountCode: code,
					trTaxCode: null,
					createdBy: crd.createdBy,
					createdDate: crd.createDate,
				});
			}
			if (crd.inventoryAssetAccountId && crd.purchaseAccountId){
				amount = crd.costPrice;
				foreignAmount = crd.costPrice;
				trEArr.push({
					transactionId,
					accountId: crd.inventoryAssetAccountId,
					DRCRCode: 'CR',
					amount: Number(Number((cashReceiptObj.fxRate * amount)).toFixed(8)),
					endBalance: 0,
					description: crd.details,
					companyId: cashReceiptObj.companyId,
					userId: crd.createdBy,
					entityTypeId: crd.allocatedTo,
					isAllocated: 'ALLOCATED',
					clientId: cashReceiptObj.clientId,
					buId: crd.buId,
					itemId: crd.itemId,
					VatRCheked,
					VatRCleared: false,
					VatRCheckedDate: crd.createDate,
					VatRCheckedBy: crd.createdBy, //test
					VatRApplicableMonth: null,
					entityId: crd.euId,
					taskId: crd.taskId,
					exchangeRate: cashReceiptObj.fxRate,
					foreignAmount,
					isTax: false,
					taxAssignAccountId: null,
					trAccountCode: code,
					trTaxCode: null,
					createdBy: crd.createdBy,
					createdDate: crd.createDate
				});
				trEArr.push({
					transactionId,
					accountId: crd.purchaseAccountId,
					DRCRCode: 'DR',
					amount: Number(Number((cashReceiptObj.fxRate * amount)).toFixed(8)),
					endBalance: 0,
					description: crd.details,
					companyId: cashReceiptObj.companyId,
					userId: crd.createdBy,
					entityTypeId: crd.allocatedTo,
					isAllocated: 'ALLOCATED',
					clientId: cashReceiptObj.clientId,
					buId: crd.buId,
					itemId: crd.itemId,
					VatRCheked,
					VatRCleared: false,
					VatRCheckedDate: crd.createDate,
					VatRCheckedBy: crd.createdBy, //test
					VatRApplicableMonth: null,
					entityId: crd.euId,
					taskId: crd.taskId,
					exchangeRate: cashReceiptObj.fxRate,
					foreignAmount,
					isTax: false,
					taxAssignAccountId: null,
					trAccountCode: code,
					trTaxCode: null,
					createdBy: crd.createdBy,
					createdDate: crd.createDate
				});
			}
			//if (crd.taxCodeId && (cashReceiptObj.amountsAre !== 1 || crd.typeTable !== 'salesDirectToNonRevenues')) {
			if (crd.taxCodeId && crd.taxCodeId !== noTaxId) {
				VatRCheked = true;
				if (crd.notaxAmount)
					if (crd.notaxAmount > 0)
						VatRCheked = false;
				DRCRCode = 'CR';
				if (crd.discountAccountId) DRCRCode = 'DR';
				if(crd.accountId === crd.taxCodeId) DRCRCode = 'DR';
				trEArr.push({
				transactionId,
				accountId: crd.taxCodeId,
				DRCRCode,
				amount: Number((cashReceiptObj.fxRate * crd.vatAmount).toFixed(8)),
				endBalance: 0,
				description: 'linked tax account of VB010 taxcode',
				companyId: cashReceiptObj.companyId,
				userId: crd.createdBy,
				entityTypeId: crd.allocatedTo,
				isAllocated: 'ALLOCATED',
				clientId: cashReceiptObj.clientId,
				buId: crd.buId,
				entityId: crd.euId,
				VatRCheked,
				VatRCleared: false,
				VatRCheckedDate: crd.createDate,
				VatRCheckedBy: crd.createdBy,
				VatRApplicableMonth: crd.createDate,
				taskId: crd.taskId,
				exchangeRate: cashReceiptObj.fxRate,
				foreignAmount: crd.vatAmount,
				isTax: true,
				taxAssignAccountId: crd.accountId,
				trAccountCode: null,
				trTaxCode: code,
				createdBy: crd.createdBy,
				createdDate: crd.createDate,
				});
			}
		});
		if (cashReceiptObj.clientUnderPayment !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashReceiptObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'DR',
				accountId: cashReceiptObj.clientUnderPayment < 0.01 ? exchangeAccount.id : paymentAccount.id,
				amount: cashReceiptObj.clientUnderPaymentModifObj.afterRate,
				endBalance: 0,
				description: cashReceiptObj.clientUnderPayment < 0.01 ? 'Convetring error' : 'Under Payment',
				companyId: cashReceiptObj.companyId,
				userId: cashReceiptObj.createdBy,
				clientId: cashReceiptObj.clientId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: cashReceiptObj.fxRate,
				foreignAmount: cashReceiptObj.clientUnderPaymentModifObj.original,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashReceiptObj.createdBy,
				createdDate: cashReceiptObj.createDate
			})
		}
		if (cashReceiptObj.clientOverPayment !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashReceiptObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'CR',
				accountId: cashReceiptObj.clientOverPayment < 0.01 ? exchangeAccount.id : paymentAccount.id,
				amount: cashReceiptObj.clientOverPaymentModifObj.afterRate,
				endBalance: 0,
				description: cashReceiptObj.clientOverPayment < 0.01 ? 'Convetring error' : 'Over Payment',
				companyId: cashReceiptObj.companyId,
				userId: cashReceiptObj.createdBy,
				clientId: cashReceiptObj.clientId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: cashReceiptObj.fxRate,
				foreignAmount: cashReceiptObj.clientOverPaymentModifObj.original,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashReceiptObj.createdBy,
				createdDate: cashReceiptObj.createDate
			})
		}
		if (cashReceiptObj.appliedUnderOverPMTBal !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashReceiptObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'DR',
				accountId: paymentAccount.id,
				amount: cashReceiptObj.appliedUnderOverPMTBal,
				endBalance: 0,
				description: 'applied over or under payment amount',
				companyId: cashReceiptObj.companyId,
				userId: cashReceiptObj.createdBy,
				clientId: cashReceiptObj.clientId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: 1.00,
				foreignAmount: cashReceiptObj.appliedUnderOverPMTBal,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashReceiptObj.createdBy,
				createdDate: cashReceiptObj.createDate
			})
		}
		return trEArr;
	}

	createItemTransactionData(cashReceiptObj) {
		const cashReceiptDetails = cashReceiptObj.cashReceiptDetails;
		let dataWarInArr = [];
		cashReceiptDetails.forEach(crd => {
			if (crd.itemId) {
				dataWarInArr.push({
					warehouseId: crd.warehouseId,
					itemId: crd.itemId,
					qty: crd.qty,
					description: crd.details,
					type: ItemsTransactionType.Sell,
					createdBy: crd.createdBy,
					createDate: crd.createDate
				});
			}
		});
		return dataWarInArr;
	}

	async createTransaction(cashReceiptHeaderId: number, countryId: number): Promise<object> {
		const cashReceiptObj = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
		let transactionNo = await this.generateTransactionNo(cashReceiptObj.companyId);
		if (cashReceiptObj.transactionNo !== null)
			transactionNo = cashReceiptObj.transactionNo;
		const createDataDtoTr = this.createDataDtoTr(cashReceiptObj, transactionNo);
		const transaction = await this.transactionService.createTransaction(createDataDtoTr, cashReceiptObj.saveTranId);
		await this.cashReceiptHeaderService.updateTranIdAndNumber(cashReceiptHeaderId, transaction.id, transactionNo);
		const createDataDtoTrE = await this.createDataDtoTrE(cashReceiptObj, transaction.id, countryId);
		const transactionEntry = await this.transactionEntryService.bulkCreateTransactionEntry(createDataDtoTrE);
		await this.cashReceiptDetailsService.destroyWhereObj({ cashReceiptHeaderId, isClientWHTax: true });
		const dataWarInArr: any = this.createItemTransactionData(cashReceiptObj);
		if (dataWarInArr.length > 0)
			await this.itemsService.warhouseInitBulk(dataWarInArr);
		return { transactionNo, transactionId: transaction.id, saveTransactionId: cashReceiptObj.saveTranId };
	}

	async check(transactionId: number, cashReceiptHeaderId: number, userId: number): Promise<boolean> {
		let checkTransaction = await this.transactionService.checkTransaction(transactionId, userId);
		if (!checkTransaction)
			return false;
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Check');
		return true;
	}

	async record(transactionId: number, cashReceiptHeaderId: number, userId: number): Promise<boolean> {
		console.log('record this');
		let recordTransaction = await this.transactionService.recordTransaction(transactionId, userId);
		console.log(recordTransaction);
		if (!recordTransaction)
			return false;
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Post');
		return true;
	}

	async destroy(companyId): Promise<boolean> {
		await this.cashReceiptHeaderService.deleteByCompanyId(companyId);
		return true;
	}

	async deleteTransaction(cashReceiptHeaderId: number): Promise<boolean> {
		const cashReceiptHeader = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
		if (!cashReceiptHeader)
			return false;
		await this.transactionService.deleteTransaction(cashReceiptHeader.tranId);
		// const createTr = await this.createTransaction(cashReceiptHeaderId);
		// if (!createTr)
		// 	return false;
		return true;
	}

	async delete(cashReceiptHeaderId: number, tranId = null): Promise<boolean> {
		if (!tranId) {
			const cashReceiptHeader = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
			if (!cashReceiptHeader)
				return false;
			tranId = cashReceiptHeader.tranId;
		}
		await this.transactionService.isDeleteTransaction(tranId);
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Deleted');
		return true;
	}

	async deleteByCompanyId(companyId: number): Promise<boolean> {
		await this.cashReceiptHeaderService.deleteByCompanyId(companyId);
		return true;
	}

	async void(cashReceiptHeaderId: number, userId: number): Promise<boolean> {
		const cashReceiptHeader = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
		if (!cashReceiptHeader)
			return false;
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Void');
		return await this.transactionService.deleteTransactionRecord(cashReceiptHeader.tranId);
	}

	async reverse(cashReceiptHeaderId: number): Promise<boolean> {
		const cashReceiptHeader = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Reverse');
		return await this.transactionService.reverseTransaction(cashReceiptHeader.tranId);
	} 

	async post(cashReceiptHeaderId: number): Promise<boolean> {
		// const cashReceiptHeader = await this.cashReceiptHeaderService.findOneById(cashReceiptHeaderId);
		await this.cashReceiptHeaderService.updateStatus(cashReceiptHeaderId, 'Reverse');
		// await this.transactionService.reverseTransaction(cashReceiptHeader.tranId);
		return true;
	}
}
