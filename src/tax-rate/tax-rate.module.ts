import { Module } from '@nestjs/common';
import { TaxRateService } from './tax-rate.service';
import { TaxRate } from "./tax-rate.model";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
  imports: [
    SequelizeModule.forFeature([
      TaxRate
    ])
  ],
  providers: [TaxRateService],
  exports: [TaxRateService]
})
export class TaxRateModule {}
