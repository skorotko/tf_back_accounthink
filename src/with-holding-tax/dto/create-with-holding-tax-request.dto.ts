import { ApiProperty } from "@nestjs/swagger";
import { CreateWithHoldingTaxDto } from "./create-with-holding-tax.dto";
import { CreateTaxRateDto } from "../../tax-rate/dto/CreateTaxRateDto";

export class CreateWithHoldingTaxRequestDto {
    @ApiProperty()
    readonly taxData: CreateWithHoldingTaxDto;

    @ApiProperty()
    readonly taxRateData: CreateTaxRateDto
}