import { Module } from '@nestjs/common';
import { XeroAccountsService } from './xero-accounts.service';

@Module({
  providers: [XeroAccountsService],
  exports: [XeroAccountsService]
})
export class XeroAccountsModule {}
