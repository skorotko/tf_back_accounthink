import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashDisbursementDetailsModel } from './cash-disbursement-details.model';
import { CashDisbursementDetailsService } from './cash-disbursement-details.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashDisbursementDetailsModel
    ])
  ],
  providers: [CashDisbursementDetailsService],
  exports: [
    CashDisbursementDetailsService,
  ]
})
export class CashDisbursementDetailsModule { }
