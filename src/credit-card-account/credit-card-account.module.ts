import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { CreditCardAccount } from "./credit-card-account.model";
import { CreditCardAccountService } from './credit-card-account.service';
import { CreditCardAccountController } from './credit-card-account.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CreditCardAccount
    ])
  ],
  providers: [CreditCardAccountService],
  controllers: [CreditCardAccountController],
  exports: [
    CreditCardAccountService,
  ]
})
export class CreditCardAccountModule {}
