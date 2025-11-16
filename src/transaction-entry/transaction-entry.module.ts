import { Module } from '@nestjs/common';
import { TransactionEntryController } from './transaction-entry.controller';
import { TransactionEntryService } from './transaction-entry.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { TransactionEntry } from "./transaction-entry.model";
import { TransactionEntryDetails } from './transaction-entry-details.model';

@Module({
  imports: [
    SequelizeModule.forFeature([TransactionEntry, TransactionEntryDetails]),
  ],
  controllers: [TransactionEntryController],
  providers: [TransactionEntryService],
  exports: [TransactionEntryService],
})
export class TransactionEntryModule {}
