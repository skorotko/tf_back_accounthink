import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from 'class-validator';

export class CreateTransactionDto {

    readonly transactionId: number;

    readonly transactionCode: string;

    readonly transactionType: string;

    readonly transactionNo: string;
    
    readonly transactionDate: Date | number;

    readonly transactionCurrency: string;

    readonly foreignCurrency: string;

    readonly transactionDescription: string;

    readonly isPosted: boolean;

    readonly postedDate: Date | number;

    readonly createdBy: number;

    readonly createdDate: Date | number;

    readonly recorderBy: any;

    readonly recorderDate: any;

    readonly accountId: number | null;

    readonly companyId: number;

    readonly amount: number;

    readonly foreignAmount: any;

    readonly exchangeRate: any;

    readonly taxTypeId: number;

    readonly reference: any;
}