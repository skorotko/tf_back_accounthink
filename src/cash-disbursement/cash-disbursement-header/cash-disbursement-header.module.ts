import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashDisbursementHeaderModel } from './cash-disbursement-header.model';
import { CashDisbursementHeaderService } from './cash-disbursement-header.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashDisbursementHeaderModel
    ])
  ],
  providers: [CashDisbursementHeaderService],
  exports: [
    CashDisbursementHeaderService,
  ]
})
export class CashDisbursementHeaderModule { }
