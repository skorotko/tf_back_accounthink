import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { ItemsModule } from 'src/items/items.module';
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { CashDisbursementDetailsModule } from './cash-disbursement-details/cash-disbursement-details.module';
import { CashDisbursementHeaderModule } from './cash-disbursement-header/cash-disbursement-header.module';
import { CashDisbursementOverPaymentsModule } from './cash-disbursement-overPayments/cash-disbursement-overPayments.module';
import { CashDisbursementPaymentsModule } from './cash-disbursement-payments/cash-disbursement-payments.module';
import { CashDisbursementController } from './cash-disbursement.controller';
import { CashDisbursementService } from './cash-disbursement.service';


@Module({
  imports: [
    CashDisbursementHeaderModule,
    CashDisbursementPaymentsModule,
    CashDisbursementDetailsModule,
    CashDisbursementOverPaymentsModule,
    TransactionEntryModule,
    TransactionModule,
    AccountModule,
    ItemsModule
  ],
  providers: [CashDisbursementService],
  controllers: [CashDisbursementController],
  exports: [
    CashDisbursementService
  ]
})
export class CashDisbursementModule { }
