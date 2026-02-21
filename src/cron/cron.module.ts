import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { TransactionModule } from "../transaction/transaction.module";
import { Cron } from "./cron.model";
import { CronService } from './cron.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Cron
    ]),
    forwardRef(() => TransactionModule),
  ],
  providers: [CronService],
  exports: [
    CronService,
  ] 
})
export class CronModule {}

