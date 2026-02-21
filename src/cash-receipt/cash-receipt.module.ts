import { Module } from '@nestjs/common';
import { CashReceiptService } from './cash-receipt.service';
import { CashReceiptController } from './cash-receipt.controller';
import { CashReceiptHeaderModule } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.module';
import { CashReceiptPaymentsModule } from 'src/cash-receipt/cash-receipt-payments/cash-receipt-payments.module';
import { CashReceiptDetailsModule } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.module';
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AccountModule } from 'src/account/account.module';
import { ItemsModule } from 'src/items/items.module';
import { CashReceiptOverPaymentsModule } from './cash-receipt-overPayments/cash-receipt-overPayments.module';

@Module({
  imports: [
    CashReceiptHeaderModule,
    CashReceiptPaymentsModule,
    CashReceiptDetailsModule,
    CashReceiptOverPaymentsModule,
    TransactionEntryModule,
    TransactionModule,
    AccountModule,
    ItemsModule
  ],
  providers: [CashReceiptService],
  controllers: [CashReceiptController],
  exports: [
    CashReceiptService
  ]
})
export class CashReceiptModule { }
