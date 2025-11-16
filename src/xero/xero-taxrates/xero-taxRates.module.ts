import { Module } from '@nestjs/common';
import { XeroTaxRatesService } from './xero-taxRates.service';

@Module({
  providers: [XeroTaxRatesService],
  exports: [XeroTaxRatesService]
})
export class XeroTaxRatesModule {}
