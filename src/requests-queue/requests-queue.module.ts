import { Module } from '@nestjs/common';
import { RequestsQueueService } from './requests-queue.service';
import { RequestsQueueController } from './requests-queue.controller';
import { RequestsQueue } from './requests-queue.model';
import { Account } from 'src/account/account.model';
import { UserAccount } from 'src/account/user-account.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      RequestsQueue,
      Account,
      UserAccount
    ]),
    AccountModule,
    TransactionModule
  ],
  providers: [RequestsQueueService],
  controllers: [RequestsQueueController]
})
export class RequestsQueueModule {}
