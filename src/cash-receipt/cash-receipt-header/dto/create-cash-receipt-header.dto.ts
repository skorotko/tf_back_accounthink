import { Transform } from 'class-transformer';
export class CreateCashReceiptHeaderDto {

	readonly crDate: Date;

	readonly clientId: number;

	readonly clientTin: string;

	readonly clientCurrency: string;

	readonly paymentCurrency: string;

	readonly fxRate: number;

	readonly whtaxRate: number;

	readonly vatWhtaxRate: number;

	readonly isWHTax: boolean;

	readonly isVatWHTax: boolean;

	readonly isSinglePayment: boolean;

	readonly isSplitPayment: boolean;

	readonly isClearingAccount: boolean;
	
	readonly isPDC: boolean;

	readonly receivedBy: number;

	readonly forUser: number;

	readonly isSDtoSRA: boolean;

	readonly isSSI: boolean;

	readonly isBoth: boolean;

	readonly amountsAre: number;

	readonly sellingNotes: string;

	readonly paymentFor: string;

	readonly otherRevenueCharges: number;

	readonly vatableAmount: number;

	readonly vatExAmount: number;

	readonly zeroRatedAmount: number;

	readonly addVat: number;

	readonly totalAmount: number;

	readonly amountVatExclusive: number;

	readonly addVatAmount: number;

	readonly totalAmountVatInclusive: number;

	readonly lessVatWHTax: number;

	readonly lessWHTax: number;

	readonly amountOwing: number;

	readonly amountReceived: number;

	readonly balanceOwing: number;

	readonly amountOwingClientCurrency: number;

	readonly balanceOwingClientCurrency: number;

	readonly templateName: string;

	readonly orNumber: string;

	readonly issueDate: Date;

	readonly isEOR: boolean;

	readonly isEN: boolean;

	readonly isEL: boolean;

	readonly clientContact: string;

	readonly clientEmail: string;

	readonly createdBy: number;
	
	readonly companyId: number;

	readonly isSales: boolean;

	readonly isDeposit: boolean;

	readonly isAdvancesFrom: boolean;

	readonly appliedUnderOverPMTBal: number;

	readonly nonRevenueCharges: number;

	readonly appliedDepositBal: number;

	readonly appliedCashAdvanceBal: number;

	readonly discount: number;

	readonly isWHTaxToggle: boolean;

	readonly isVatWHTaxToggle: boolean; 

	readonly isUseBalanceToggle: boolean;

	readonly typeOfBusiness: string;

	readonly paymentTerms: string;

	readonly serviceVATCode: string;

	readonly productVATCode: string;
}