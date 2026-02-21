import { Module } from '@nestjs/common';
import { ExpendituresQueueService } from './expenditures-queue.service';
import { ExpendituresQueueController } from './expenditures-queue.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExpendituresQueue } from './expenditures-queue.model';
import { Account } from 'src/account/account.model';
import { UserAccount } from 'src/account/user-account.model';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ExpendituresQueue, Account, UserAccount]),
    AccountModule,
    TransactionModule,
  ],
  providers: [ExpendituresQueueService],
  controllers: [ExpendituresQueueController],
})
export class ExpendituresQueueModule {}
