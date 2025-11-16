class CashDisbursementPaymentValue {

	// readonly cashDisbursementHeaderId: number;

	// readonly receivedDate: number;

	// readonly receivedBy: number;

	// readonly paymentMethodId: number;

	// readonly depositAccountId: number;

	// readonly chequeRefNo: string;

	// readonly amountReceived: number;

	// readonly companyId: number;

	// readonly createdBy: number;


	readonly  cashDisbursementHeaderId: number;

	readonly  paidDate: number;

	readonly  paymentMethodId: number;

	readonly  depositAccountId: number;

	readonly  chequeRefNo: string;

	readonly  dateOfCheque: Date;

	readonly  chequeIssueDate: Date;

	readonly  chequeIssuedBy: number;

	readonly	amountPaid: number;

	readonly  balanceToReceived: number;

	readonly  paymentStatus: string;

	readonly foreignAmountPaid: number;
	
	readonly paymentCurrency: string;

}


export class CreateCashDisbursementPaymentsDto {
	readonly cashDisbursementPaymentsList: CashDisbursementPaymentValue[];

	readonly companyId: number;

	readonly createdBy: number;
}