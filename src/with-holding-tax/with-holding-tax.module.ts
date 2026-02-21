import { Module } from '@nestjs/common';
import { WithHoldingTaxController } from './with-holding-tax.controller';
import { WithHoldingTaxService } from './with-holding-tax.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { TaxRateModule } from "../tax-rate/tax-rate.module";
import { WithHoldingTax } from "./with-holding-tax.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      WithHoldingTax
    ]),
    TaxRateModule
  ],
  controllers: [WithHoldingTaxController],
  providers: [WithHoldingTaxService],
  exports: [WithHoldingTaxService]
})
export class WithHoldingTaxModule {}
