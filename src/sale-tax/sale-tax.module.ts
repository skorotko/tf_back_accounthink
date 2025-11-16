import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { TaxRateModule } from "../tax-rate/tax-rate.module";
import { SaleTax } from "./sale-tax.model";
import { SaleTaxService } from "./sale-tax.service";
import { SaleTaxController } from "./sale-tax.controller";
import { TaxTypeModule } from "../tax-type/tax-type.module";
import { ZeroTaxTypeModule } from "../zero-tax-type/zero-tax-type.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      SaleTax
    ]),
    TaxRateModule,
    ZeroTaxTypeModule,
    TaxTypeModule
  ],
  providers: [SaleTaxService],
  controllers: [SaleTaxController],
  exports: [SaleTaxService]
})
export class SaleTaxModule {}
