import { Module } from '@nestjs/common';
import { XeroItemsService } from './xero-items.service';

@Module({
  controllers: [],
  providers: [XeroItemsService],
  exports: [XeroItemsService]
})
export class XeroItemsModule {}
