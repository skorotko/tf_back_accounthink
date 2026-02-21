import { ApiProperty } from "@nestjs/swagger";

export class PaymentMethodDto {
    @ApiProperty({example: 1, description: 'Identification country'})
    readonly companyId: number;

    @ApiProperty({example: 'Payment Method Name', description: 'Payment Method name'})
    readonly name: string;

    @ApiProperty({description: 'Payment Method code'})
    readonly code: string;

    @ApiProperty({description: ''})
    readonly multiAccount: boolean

    @ApiProperty({description: ''})
    accountId: Array<number>
}