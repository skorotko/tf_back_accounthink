import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {PaymentMethod} from "./payment-method.model";
import {AccountModule} from "../account/account.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentMethod
    ]),
    AccountModule
  ],
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  exports: [PaymentMethodService]
})
export class PaymentMethodModule {}
