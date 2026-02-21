import { Module } from '@nestjs/common';
import { CashDisbursementDetailsModule } from 'src/cash-disbursement/cash-disbursement-details/cash-disbursement-details.module';
import { CashReceiptDetailsModule } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.module';
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';
import { CheckEntityController } from './check-entity.controller';
import { CheckEntityService } from './check-entity.service';

@Module({
  imports: [
    CashReceiptDetailsModule,
    TransactionEntryModule,
    CashDisbursementDetailsModule
  ],
  controllers: [CheckEntityController],
  providers: [CheckEntityService],
  exports: [
    CheckEntityService,
  ]
})
export class CheckEntityModule { }
