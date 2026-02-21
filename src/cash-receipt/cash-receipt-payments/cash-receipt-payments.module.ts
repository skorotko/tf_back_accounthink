import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashReceiptPaymentsModel } from './cash-receipt-payments.model';
import { CashReceiptPaymentsService } from './cash-receipt-payments.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashReceiptPaymentsModel
    ])
  ],
  providers: [CashReceiptPaymentsService],
  exports: [
    CashReceiptPaymentsService,
  ]
})
export class CashReceiptPaymentsModule {}
