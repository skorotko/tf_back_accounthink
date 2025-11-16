import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Transaction } from "./transaction.model";
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { GroupModule } from 'src/group/group.module';
import { CronModule } from 'src/cron/cron.module';
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Transaction
    ]),
    GroupModule,
    forwardRef(() => CronModule),
    TransactionEntryModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
