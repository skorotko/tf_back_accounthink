class CashReceiptDetailValue {

	// readonly cashReceiptHeaderId: number;

	// readonly accountNumber: string;

	// readonly accountId: number;

	// readonly details: string;

	// readonly unitPrice: number;
	
	// readonly unitId: number;
	 
	// readonly qty: number;

	// readonly totalAmount: number;

	// readonly isSCPWD: boolean;

	// readonly scpwdDiscountRate: number;

	// readonly discountAmount: number;

	// readonly taxAmount: number;

	// readonly vatableExcludingAmount: number;

	// readonly vatableIncludingAmount: number;

	// readonly vatExAmount: number;

	// readonly zeroRatedAmount: number;

	// readonly allocatedTo: number;

	// readonly buId: number;

	// readonly whsengproId: number;

	// readonly taskId: number;

	// readonly euId: number;

	// readonly isOtherRevenue: boolean;

	// readonly companyId: number;

	// readonly createdBy: number;

	readonly cashReceiptHeaderId: number;

	readonly accountNumber: string;

	readonly accountId: number;

	readonly itemId: number;

	readonly inventoryAssetAccountId: number;

	readonly purchaseAccountId: number;

	readonly costPrice: number;

	readonly warehouseId: number;

	readonly details: string;

	readonly typeTable: string;

	readonly unitPrice: number;

	readonly unitId: number;

	readonly qty: number;

	readonly totalAmount: number;

	readonly taxCodeId: number;

	readonly taxRate: number;

	readonly vatableAmount: number;

	readonly vatExemptAmount: number;

	readonly zeroRatedAmount: number;

	readonly vatAmount: number;

	readonly notaxAmount: number;

	readonly isOtherRevenue: boolean;

	readonly allocatedTo: number;

	readonly buId: number;

	readonly whsengproId: number;

	readonly taskId: number;

	readonly euId: number;

	readonly isClientWHTax: boolean;

	readonly discount: number;

	readonly isNonRevenue: boolean;

	readonly discountAccountId: number;
}
export class CreateCashReceiptDetailsDto {
	readonly cashReceiptDetailsList: CashReceiptDetailValue[];

	readonly companyId: number;

	readonly createdBy: number;
}