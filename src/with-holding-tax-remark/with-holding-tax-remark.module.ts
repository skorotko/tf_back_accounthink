import { Module } from '@nestjs/common';
import { WithHoldingTaxRemarkService } from './with-holding-tax-remark.service';
import { WithHoldingTaxRemarkController } from './with-holding-tax-remark.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { WithHoldingTaxRemark } from "./with-holding-tax-remark";

@Module({
  imports: [
    SequelizeModule.forFeature([
      WithHoldingTaxRemark
    ])
  ],
  providers: [WithHoldingTaxRemarkService],
  controllers: [WithHoldingTaxRemarkController]
})
export class WithHoldingTaxRemarkModule {}
