import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Account } from "./account.model";
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AccountType } from './accountType.model';
import { TaxTypeModule } from "../tax-type/tax-type.module";
import { SaleTaxModule } from "../sale-tax/sale-tax.module";
import { WithHoldingTaxModule } from "../with-holding-tax/with-holding-tax.module";
import { TransactionModule } from "../transaction/transaction.module";
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';
import { UserAccount } from './user-account.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Account,
      AccountType,
      UserAccount
    ]),
    TransactionModule,
    TransactionEntryModule,
    TaxTypeModule,
    SaleTaxModule,
    WithHoldingTaxModule
  ],
  providers: [AccountService],
  controllers: [AccountController],
  exports: [
    AccountService,
  ]
})
export class AccountModule {}
