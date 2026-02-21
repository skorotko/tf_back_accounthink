import { Module, Scope } from '@nestjs/common';
import { XeroController } from './xero.controller';
import { XeroService } from './xero.service';
import { XeroItemsModule } from './xero-items/xero-items.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Xero } from './xero.model';
import { XeroClient } from 'xero-node';
import { XeroAccountsModule } from './xero-accounts/xero-accounts.module';
import { XeroTaxRatesModule } from './xero-taxrates/xero-taxRates.module';
import { XeroContactsModule } from './xero-contacts/xero-contacts.module';


@Module({
  controllers: [XeroController],
  providers: [
    XeroService
  ],
  imports: [
    XeroItemsModule,
    SequelizeModule.forFeature([
      Xero
    ]),
    XeroAccountsModule,
    XeroTaxRatesModule,
    XeroContactsModule
  ]
})
export class XeroModule {}
