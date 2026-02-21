import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { AccountModule } from "../account/account.module";
import { ClassesModule } from "../classes/classes.module";
import { GroupModule } from "../group/group.module";
import { CashReceiptModule } from 'src/cash-receipt/cash-receipt.module';
import { ItemsModule } from "../items/items.module";

@Module({
  imports: [
    AccountModule,
    ClassesModule,
    GroupModule,
    CashReceiptModule,
    ItemsModule
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [
    RegistrationService
  ]
})
export class RegistrationModule {}
