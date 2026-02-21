import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashReceiptDetailsModel } from './cash-receipt-details.model';
import { CashReceiptDetailsService } from './cash-receipt-details.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashReceiptDetailsModel
    ])
  ],
  providers: [CashReceiptDetailsService],
  exports: [
    CashReceiptDetailsService,
  ]
})
export class CashReceiptDetailsModule {}
