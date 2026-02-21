import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashReceiptOverPaymentsModel } from './cash-receipt-overPayments.model';
import { CashReceiptOverPaymentsService } from './cash-receipt-overPayments.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashReceiptOverPaymentsModel
    ])
  ],
  providers: [CashReceiptOverPaymentsService],
  exports: [
    CashReceiptOverPaymentsService,
  ]
})
export class CashReceiptOverPaymentsModule {}
