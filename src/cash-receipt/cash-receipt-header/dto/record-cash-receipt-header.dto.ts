export class RecordCashReceiptHeaderDto {

	readonly templateName: string;

	readonly orNumber: string;

	readonly issueDate: Date;

	readonly isEOR: boolean;

	readonly isEN: boolean;

	readonly isEL: boolean;

	readonly clientContact: string;

	readonly clientEmail: string;

	readonly recordedBy: number;
}