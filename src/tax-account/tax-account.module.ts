import { Module } from '@nestjs/common';
import { TaxAccountService } from './tax-account.service';
import { TaxAccountController } from './tax-account.controller';
import { SaleTaxModule } from "../sale-tax/sale-tax.module";
import { WithHoldingTaxModule } from "../with-holding-tax/with-holding-tax.module";
import { AccountModule } from "../account/account.module";
import { ZeroTaxTypeModule } from "../zero-tax-type/zero-tax-type.module";

@Module({
  imports: [
    SaleTaxModule,
    WithHoldingTaxModule,
    AccountModule,
    ZeroTaxTypeModule
  ],
  providers: [TaxAccountService],
  controllers: [TaxAccountController],
  exports: [TaxAccountService]
})
export class TaxAccountModule {}
