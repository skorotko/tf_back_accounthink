class CashDisbursementDetailValue {

	readonly cashDisbursementHeaderId: number;

	readonly accountNumber: string;

	readonly accountId: number;

	readonly itemId: number;

	readonly warehouseId: number;

	readonly details: string;

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

	readonly isOtherExpenditure: boolean;

	readonly allocatedTo: number;

	readonly buId: number;

	readonly whsengproId: number;

	readonly taskId: number;

	readonly euId: number;

	readonly isVendorWHTax: boolean;

	readonly itemNo: string;

	readonly itemName: string;

	readonly discount: number;
	
	readonly isNonCost: boolean;

	readonly typeTable: string;

	readonly isOtherRevenue: boolean;

	readonly discountAccountId: number;
}

export class CreateCashDisbursementDetailsDto {
	readonly cashDisbursementDetailsList: CashDisbursementDetailValue[];

	readonly companyId: number;

	readonly createdBy: number;
}