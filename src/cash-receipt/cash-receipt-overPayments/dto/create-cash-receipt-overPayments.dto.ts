class CashReceiptOverPaymentValue {

	readonly cashReceiptHeaderIdOut: number;

	readonly date: number;

	readonly overpmtcr: number;

	readonly amtApplied: number;

	readonly owing: number;

	readonly crid: string;
}


export class CreateCashReceiptOverPaymentsDto {
	readonly cashReceiptPaymentsList: CashReceiptOverPaymentValue[];

	readonly cashReceiptHeaderIdIn: number;

	readonly companyId: number;

	readonly createdBy: number;
}