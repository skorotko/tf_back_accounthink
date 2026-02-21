class CashReceiptPaymentValue {

	// readonly cashReceiptHeaderId: number;

	// readonly receivedDate: number;

	// readonly receivedBy: number;

	// readonly paymentMethodId: number;

	// readonly depositAccountId: number;

	// readonly chequeRefNo: string;

	// readonly amountReceived: number;

	// readonly companyId: number;

	// readonly createdBy: number;


	readonly  cashReceiptHeaderId: number;

	readonly  receivedDate: number;

	readonly  paymentMethodId: number;

	readonly  depositAccountId: number;

	readonly  chequeRefNo: string;

	readonly  dateOfCheque: Date;

	readonly  chequeIssueDate: Date;

	readonly  chequeIssuedBy: number;

	readonly  amountReceived: number;

	readonly  balanceToReceived: number;

	readonly  paymentStatus: string;

	readonly foreignAmountReceived: number;
	
	readonly paymentCurrency: string;

}


export class CreateCashReceiptPaymentsDto {
	readonly cashReceiptPaymentsList: CashReceiptPaymentValue[];

	readonly companyId: number;

	readonly createdBy: number;
}