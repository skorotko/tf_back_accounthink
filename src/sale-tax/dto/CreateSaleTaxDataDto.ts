import { ApiProperty } from "@nestjs/swagger";
import { CreateSaleTaxDto } from "./CreateSaleTax";
import { CreateTaxRateDto } from "../../tax-rate/dto/CreateTaxRateDto";

export class CreateSaleTaxRequestDto {
    @ApiProperty()
    readonly taxData: CreateSaleTaxDto;

    @ApiProperty()
    readonly taxRateData: CreateTaxRateDto
}