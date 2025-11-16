import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashDisbursementOverPaymentsModel } from './cash-disbursement-overPayments.model';
import { CashDisbursementOverPaymentsService } from './cash-disbursement-overPayments.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashDisbursementOverPaymentsModel
    ])
  ],
  providers: [CashDisbursementOverPaymentsService],
  exports: [
    CashDisbursementOverPaymentsService,
  ]
})
export class CashDisbursementOverPaymentsModule { }
