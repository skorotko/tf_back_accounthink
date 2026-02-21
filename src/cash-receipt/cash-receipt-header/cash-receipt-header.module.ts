import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CashReceiptHeaderModel } from './cash-receipt-header.model';
import { CashReceiptHeaderService } from './cash-receipt-header.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CashReceiptHeaderModel
    ])
  ],
  providers: [CashReceiptHeaderService],
  exports: [
    CashReceiptHeaderService,
  ]
})
export class CashReceiptHeaderModule {}
