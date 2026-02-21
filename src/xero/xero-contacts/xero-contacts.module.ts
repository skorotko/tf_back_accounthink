import { Module } from '@nestjs/common';
import { XeroContactsService } from './xero-contacts.service';

@Module({
  controllers: [],
  providers: [XeroContactsService],
  exports: [XeroContactsService]

})
export class XeroContactsModule {}
