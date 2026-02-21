import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { CreateTransactionEntryDto } from 'src/transaction-entry/dto/create-transaction-entry.dto';
import { TransactionEntryService } from 'src/transaction-entry/transaction-entry.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { CashDisbursementDetailsService } from './cash-disbursement-details/cash-disbursement-details.service';
import { CashDisbursementHeaderModel } from './cash-disbursement-header/cash-disbursement-header.model';
import { CashDisbursementHeaderService } from './cash-disbursement-header/cash-disbursement-header.service';
import { v4 as uuidv4 } from 'uuid';
import { ItemsService } from 'src/items/items.service';
import { ItemsTransactionType } from 'src/items/models/items-transaction.model';

//export interface CashDisbursementService extends CashDisbursementHeaderService { }
@Injectable()
export class CashDisbursementService {
	constructor(private transactionService: TransactionService,
		private transactionEntryService: TransactionEntryService,
		private cashDisbursementHeaderService: CashDisbursementHeaderService,
		private cashDisbursementDetailsService: CashDisbursementDetailsService,
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
		const whereObj = { companyId, transactionCode: 'CASHDISBURSEMENT' };
		const getLastTransaction = await this.transactionService.getLastTransaction(whereObj);
		if (!getLastTransaction)
			return "CD-AA000001";
		let str = getLastTransaction.transactionNo.slice(3);
		let num = parseInt(str.slice(2));
		if (num >= 999999) {
			str = this.incrementLetter(str);
			num = 1;
		} else {
			num++;
		}
		str = 'CD-' + str.slice(0, 2) + num.toString().padStart(6, "0");
		return str;
	}

	createDataDtoTr(cashDisbursementObj: CashDisbursementHeaderModel, transactionNo: string): CreateTransactionDto {
		return {
			transactionId: 1,
			transactionCode: 'CASHDISBURSEMENT',
			transactionType: 'CASHDISBURSEMENT',
			transactionNo,
			transactionDate: cashDisbursementObj.cdDate,
			transactionCurrency: 'PHP',
			foreignCurrency: cashDisbursementObj.vendorCurrency,
			transactionDescription: cashDisbursementObj.purchasingNotes,
			isPosted: true,
			postedDate: cashDisbursementObj.cdDate,
			createdBy: cashDisbursementObj.cashDisbursementPayments[0].createdBy,
			createdDate: cashDisbursementObj.cdDate,
			recorderBy: null,
			recorderDate: null,
			accountId: null,
			companyId: cashDisbursementObj.companyId,
			amount: null,
			foreignAmount: null,
			exchangeRate: cashDisbursementObj.fxRate,
			taxTypeId: cashDisbursementObj.amountsAre,
			reference: null
		};
	}

	async createDataDtoTrE(cashDisbursementObj: CashDisbursementHeaderModel, transactionId: number,  countryId: number): Promise<CreateTransactionEntryDto[]> {
		const cashDisbursementPayments = cashDisbursementObj.cashDisbursementPayments;
		const cashDisbursementDetails = cashDisbursementObj.cashDisbursementDetails;
		const paymentAccount = await this.accountService.getAccountByDefaultId(10, cashDisbursementObj.companyId)
		const noTax: any = await this.accountService.getNoTaxAccount(cashDisbursementObj.companyId, countryId, 2);
		let noTaxId = 0;
		if (noTax.length > 0)
			if(noTax[0])
				noTaxId = noTax[0].id;
		let trEArr = [];
		let VatRCheked = false;
		cashDisbursementPayments.forEach(cdp => {
			let amount = Number((cashDisbursementObj.fxRate * cdp.amountPaidModifObj.original).toFixed(8));
			let foreignAmount = cdp.amountPaid;
			if (cashDisbursementObj.vendorCurrency !== cashDisbursementObj.paymentCurrency) {
				amount = cdp.amountPaid;
				foreignAmount = Number((cdp.amountPaidModifObj.original / cashDisbursementObj.fxRate).toFixed(8));
			}
			let dataDtoTrE = {
				transactionId,
				accountId: cdp.depositAccountId,
				DRCRCode: 'CR',
				amount,
				endBalance: 0,
				description: cashDisbursementObj.purchasingNotes,
				companyId: cashDisbursementObj.companyId,
				userId: cdp.createdBy,
				//entityTypeId: 2,
				entityTypeId: null,
				isAllocated: 'ALLOCATED',
				vendorId: cashDisbursementObj.vendorId,
				//entityId: 684,
				entityId: null,
				taskId: null,
				exchangeRate: cashDisbursementObj.fxRate,
				foreignAmount,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cdp.createdBy,
				createdDate: cdp.createDate
			}
			trEArr.push(dataDtoTrE);
		});
		cashDisbursementDetails.forEach(crd => {
			if (cashDisbursementObj.isVatWHTaxExapnded && !cashDisbursementObj.isVatWHTaxToggle && crd.taxRate === 0 && crd.totalAmount === 0)
				return
			let amount = crd.totalAmountModifObj.original;
			let foreignAmount = crd.totalAmount;
			if (crd.vatableAmount !== 0) {
				amount = crd.vatableAmountModifObj.original;
				foreignAmount = crd.vatableAmount;
			}
			let code = uuidv4();
			let DRCRCode = 'DR';
			if (crd.isVendorWHTax)
				DRCRCode = 'CR';
			if (crd.discountAccountId)
				DRCRCode = 'CR';
			if (crd.accountId !== crd.taxCodeId) {
				VatRCheked = false;
				trEArr.push({
					transactionId,
					accountId: crd.accountId,
					DRCRCode,
					amount: Number((cashDisbursementObj.fxRate * amount).toFixed(8)),
					endBalance: 0,
					description: crd.details,
					companyId: cashDisbursementObj.companyId,
					userId: crd.createdBy,
					entityTypeId: crd.allocatedTo,
					isAllocated: 'ALLOCATED',
					vendorId: cashDisbursementObj.vendorId,
					buId: crd.buId,
					itemId: crd.itemId,
					VatRCheckedDate: null,
					VatRCheckedBy: null,
					VatRApplicableMonth: null,
					entityId: crd.euId,
					taskId: crd.taskId,
					exchangeRate: cashDisbursementObj.fxRate,
					foreignAmount,
					isTax: false,
					taxAssignAccountId: null,
					trAccountCode: code,
					trTaxCode: null,
					createdBy: crd.createdBy,
					createdDate: crd.createDate
				});
			}
			console.log(crd.taxCodeId);
			console.log(noTaxId);
			if (crd.taxCodeId && crd.taxCodeId !== noTaxId) {
				VatRCheked = true;
				if (crd.notaxAmount)
					if (crd.notaxAmount > 0)
						VatRCheked = false;
				DRCRCode = 'DR';
				if (crd.discountAccountId)
					DRCRCode = 'CR';
				if (crd.accountId === crd.taxCodeId) DRCRCode = 'CR'; 
				trEArr.push({
					transactionId,
					accountId: crd.taxCodeId,
					DRCRCode,
					amount: Number((cashDisbursementObj.fxRate * crd.vatAmountModifObj.original).toFixed(8)), 
					endBalance: 0,
					description: 'linked tax account of VB010 taxcode',
					companyId: cashDisbursementObj.companyId,
					userId: crd.createdBy,
					entityTypeId: crd.allocatedTo,
					isAllocated: 'ALLOCATED',
					vendorId: cashDisbursementObj.vendorId,
					VatRCheked,
					VatRCleared: false,
					VatRCheckedDate: crd.createDate,
					VatRCheckedBy: crd.createdBy,
					VatRApplicableMonth: crd.createDate,
					buId: crd.buId,
					entityId: crd.euId,
					taskId: crd.taskId,
					exchangeRate: cashDisbursementObj.fxRate,
					foreignAmount: crd.vatAmount,
					isTax: true,
					taxAssignAccountId: crd.accountId,
					trAccountCode: null,
					trTaxCode: code,
					createdBy: crd.createdBy,
					createdDate: crd.createDate
				});
			}
		});
		if (cashDisbursementObj.vendorUnderPayment !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashDisbursementObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'CR',
				accountId: paymentAccount.id,
				amount: cashDisbursementObj.vendorUnderPaymentModifObj.afterRate,
				endBalance: 0,
				description: 'Under Payment',
				companyId: cashDisbursementObj.companyId,
				userId: cashDisbursementObj.createdBy,
				vendorId: cashDisbursementObj.vendorId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: cashDisbursementObj.fxRate,
				foreignAmount: cashDisbursementObj.vendorUnderPaymentModifObj.original,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashDisbursementObj.createdBy,
				createdDate: cashDisbursementObj.createDate
			})
		}
		if (cashDisbursementObj.vendorOverPayment !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashDisbursementObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'DR',
				accountId: paymentAccount.id,
				amount: cashDisbursementObj.vendorOverPaymentModifObj.afterRate,
				endBalance: 0,
				description: 'Over Payment',
				companyId: cashDisbursementObj.companyId,
				userId: cashDisbursementObj.createdBy,
				vendorId: cashDisbursementObj.vendorId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: cashDisbursementObj.fxRate,
				foreignAmount: cashDisbursementObj.vendorOverPaymentModifObj.original,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashDisbursementObj.createdBy,
				createdDate: cashDisbursementObj.createDate
			})
		}
		if (cashDisbursementObj.appliedUnderOverPMTBal !== 0) {
			trEArr.push({
				transactionId,
				// accountId: cashReceiptObj.balanceOwing > 0 ? 10 : 11,
				DRCRCode: 'CR',
				accountId: paymentAccount.id,
				amount: cashDisbursementObj.appliedUnderOverPMTBal,
				endBalance: 0,
				description: 'applied over or under payment amount',
				companyId: cashDisbursementObj.companyId,
				userId: cashDisbursementObj.createdBy,
				clientId: cashDisbursementObj.vendorId,
				// entityTypeId: 2,
				// entityId: 684,
				entityTypeId: null,
				entityId: null,
				taskId: null,
				exchangeRate: 1.00,
				foreignAmount: cashDisbursementObj.appliedUnderOverPMTBal,
				isTax: false,
				taxAssignAccountId: null,
				createdBy: cashDisbursementObj.createdBy,
				createdDate: cashDisbursementObj.createDate
			})
		}
		return trEArr;
	}

	createItemTransactionData(cashDisbursementObj) {
		const cashDisbursementDetails = cashDisbursementObj.cashDisbursementDetails;
		let dataWarInArr = [];		
		cashDisbursementDetails.forEach(crd => {
			if (crd.itemId){
				dataWarInArr.push({
					warehouseId: crd.warehouseId,
					itemId: crd.itemId,
					qty: crd.qty,
					description: crd.details,
					type: ItemsTransactionType.Buy,
					createdBy: crd.createdBy,
					createDate: crd.createDate
				});
			}
		});
		return dataWarInArr;
	}

	async createTransaction(cashDisbursementHeaderId: number,  countryId: number): Promise<object> {
		const cashDisbursementObj = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
		let transactionNo = await this.generateTransactionNo(cashDisbursementObj.companyId);
		if (cashDisbursementObj.transactionNo !== null)
			transactionNo = cashDisbursementObj.transactionNo;
		const createDataDtoTr = this.createDataDtoTr(cashDisbursementObj, transactionNo);
		const transaction = await this.transactionService.createTransaction(createDataDtoTr, cashDisbursementObj.saveTranId);
		await this.cashDisbursementHeaderService.updateTranIdAndNumber(cashDisbursementHeaderId, transaction.id, transactionNo);
		const createDataDtoTrE = await this.createDataDtoTrE(cashDisbursementObj, transaction.id, countryId);
		const transactionEntry = await this.transactionEntryService.bulkCreateTransactionEntry(createDataDtoTrE);
		await this.cashDisbursementDetailsService.destroyWhereObj({ cashDisbursementHeaderId, isVendorWHTax: true });
		const dataWarInArr: any = this.createItemTransactionData(cashDisbursementObj);
		if(dataWarInArr.length > 0)
			await this.itemsService.warhouseInitBulk(dataWarInArr);
		return { transactionNo, transactionId: transaction.id, saveTransactionId: cashDisbursementObj.saveTranId };
	}

	async check(transactionId: number, cashDisbursementHeaderId: number, userId: number): Promise<boolean> {
		let checkTransaction = await this.transactionService.checkTransaction(transactionId, userId);
		if (!checkTransaction)
			return false;
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Check');
		return true;
	}

	async record(transactionId: number, cashDisbursementHeaderId: number, userId: number): Promise<boolean> {
		let recordTransaction = await this.transactionService.recordTransaction(transactionId, userId);
		if (!recordTransaction)
			return false;
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Post');
		return true;
	}

	// async destroy(companyId): Promise<boolean> {
	// 	await this.cashDisbursementHeaderService.destroy(companyId);
	// 	return true;
	// }

	async updateTransaction(cashDisbursementHeaderId: number): Promise<boolean> {
		const cashDisbursementHeader = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
		if (!cashDisbursementHeader)
			return false;
		await this.transactionService.deleteTransaction(cashDisbursementHeader.tranId);
		// const createTr = await this.createTransaction(cashDisbursementHeaderId);
		// if (!createTr)
		// 	return false;
		return true;
	}

	async delete(cashDisbursementHeaderId: number, tranId = null): Promise<boolean> {
		if (!tranId) {
			const cashDisbursementHeader = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
			if (!cashDisbursementHeader)
				return false;
			tranId = cashDisbursementHeader.tranId;
		}
		await this.transactionService.isDeleteTransaction(tranId);
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Deleted');
		return true;
	}

	async void(cashDisbursementHeaderId: number, userId: number): Promise<boolean> {
		const cashDisbursementHeader = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
		if (!cashDisbursementHeader)
			return false;
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Void');
		return await this.transactionService.deleteTransactionRecord(cashDisbursementHeader.tranId);
	}

	async reverse(cashDisbursementHeaderId: number): Promise<boolean> {
		const cashDisbursementHeader = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Reverse');
		return await this.transactionService.reverseTransaction(cashDisbursementHeader.tranId);
	}

	async post(cashDisbursementHeaderId: number): Promise<boolean> {
		// const cashDisbursementHeader = await this.cashDisbursementHeaderService.findOneById(cashDisbursementHeaderId);
		await this.cashDisbursementHeaderService.updateStatus(cashDisbursementHeaderId, 'Post');
		// await this.transactionService.reverseTransaction(cashDisbursementHeader.tranId);
		return true;
	}

	async deleteByCompanyId(companyId: number): Promise<boolean> {
		await this.cashDisbursementHeaderService.deleteByCompanyId(companyId);
		return true;
	}
}
