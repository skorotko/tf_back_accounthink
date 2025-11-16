export class RecordCashDisbursementHeaderDto {

	readonly templateName: string;

	readonly cvNumber: string;

	readonly issueDate: Date;

	readonly isECV: boolean;

	readonly isEN: boolean;

	readonly isEL: boolean;

	readonly vendorContact: string;

	readonly vendorEmail: string;

	readonly recordedBy: number;
}