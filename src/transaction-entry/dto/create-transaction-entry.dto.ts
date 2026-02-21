import { ApiProperty } from "@nestjs/swagger";

export class CreateTransactionEntryDto {

    readonly transactionId: number;

    readonly accountId: number;

    readonly DRCRCode: string;

    readonly amount: number;

    readonly endBalance: number;

    readonly description: string;

    readonly companyId: number;

    readonly userId: number;

    readonly entityTypeId: any;

    readonly entityId: any;
    
    readonly taskId: any;

    readonly foreignAmount: any;

    readonly exchangeRate: any;

    readonly isTax: boolean;

    readonly taxAssignAccountId: any;

    readonly createdBy: number;

    readonly createdDate: number;

    readonly trAccountCode: string | null;

    readonly trTaxCode: string | null;

    readonly VatRCheked: boolean | null;

    readonly itemId: number | null;

    readonly VatRCheckedDate: number | null;

    readonly VatRCheckedBy: number | null;

    readonly VatRApplicableMonth: number | null;
}