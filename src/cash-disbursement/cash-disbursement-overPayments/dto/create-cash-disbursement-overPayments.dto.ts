class CashDisbursementOverPaymentValue {

	readonly cashDisbursementHeaderIdOut: number;

	readonly date: number;

	readonly overpmtcr: number;

	readonly amtApplied: number;

	readonly owing: number;

	readonly cdid: string;
}


export class CreateCashDisbursementOverPaymentsDto {
	readonly cashDisbursementPaymentsList: CashDisbursementOverPaymentValue[];

	readonly cashDisbursementHeaderIdIn: number;

	readonly companyId: number;

	readonly createdBy: number;
}