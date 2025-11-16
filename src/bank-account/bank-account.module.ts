import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { BankAccount } from "./bank-account.model";
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      BankAccount
    ])
  ],
  providers: [BankAccountService],
  controllers: [BankAccountController],
  exports: [
    BankAccountService,
  ]
})
export class BankAccountModule {}
