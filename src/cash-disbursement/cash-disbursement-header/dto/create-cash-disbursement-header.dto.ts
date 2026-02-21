export class CreateCashDisbursementHeaderDto {
	
	readonly cdDate: Date;
	
	readonly vendorId: number;
	
	readonly vendorTin: string;
	
	readonly vendorCurrency: string;

	readonly paymentCurrency: string;
	
	readonly fxRate: number;
	
	readonly whtaxExpandedRate: number;
	
	readonly vatWhtaxExpandedRate: number;
	
	readonly isWHTaxExpanded: boolean;
	
	readonly isVatWHTaxExapnded: boolean;
	
	readonly isSinglePayment: boolean;
	
	readonly isSplitPayment: boolean;
	
	readonly isClearingAccount: boolean;
	
	readonly isPDC: boolean;
	
	readonly paidBy: number;
	
	readonly forUser: number;
	
	readonly isCostService: boolean;
	
	readonly isExpense: boolean;
	
	readonly isBuyingItems: boolean;
	
	readonly isBoth: boolean;

	readonly isChangeDirectToCostBoth: boolean;
	
	readonly amountsAre: number;
	
	readonly purchasingNotes: string;
	
	readonly otherExpendituresCharges: number;
	
	readonly vatableAmount: number;
	
	readonly vatExAmount: number;
	
	readonly zeroRatedAmount: number;
	
	readonly addVat: number;
	
	readonly totalAmount: number;
	
	readonly amountVatExclusive: number;
	
	readonly addVatAmount: number;
	
	readonly totalAmountVatInclusive: number;
	
	readonly lessVatWHTaxExpanded: number;
	
	readonly lessWHTaxExpanded: number;
	
	readonly amountOwing: number;
	
	readonly amountPaid: number;
	
	readonly balanceOwing: number;
	
	readonly amountOwingVendorCurrency: number;
	
	readonly balanceOwingVendorCurrency: number;
	
	readonly templateName: string;
	
	readonly cvNumber: string;
	
	readonly issueDate: Date;
	
	readonly isECV: boolean;
	
	readonly isEN: boolean;
	
	readonly isEL: boolean;
	
	readonly vendorContact: string;
	
	readonly vendorEmail: string;
	
	readonly createdBy: number;
	
	readonly companyId: number;

	readonly paymentFor: string;

	readonly discount: number;

	readonly isCostExpenses: boolean;

	readonly isPurchaseAsset: boolean;

	readonly isPrepaymentsDeposits: boolean;

	readonly isOthers: boolean;

	readonly nonCostCharges: number;

	readonly appliedUnderOverPMTBal: number;

	readonly typeOfBusiness: string;

	readonly paymentTerms: string;

	readonly serviceVATCode: string;

	readonly productVATCode: string;

	readonly isWHTaxToggle: boolean;

	readonly isVatWHTaxToggle: boolean;

	readonly isUseBalanceToggle: boolean;
}