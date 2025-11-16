import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashDisbursementPaymentsModel } from './cash-disbursement-payments.model';
import { CashDisbursementPaymentsService } from './cash-disbursement-payments.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashDisbursementPaymentsModel
    ])
  ],
  providers: [CashDisbursementPaymentsService],
  exports: [
    CashDisbursementPaymentsService,
  ]
})
export class CashDisbursementPaymentsModule { }
