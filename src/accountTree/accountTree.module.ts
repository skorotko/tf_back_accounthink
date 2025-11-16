import { Module } from '@nestjs/common';
import { AccountTreeService } from './accountTree.service';
import { AccountTreeController } from './accountTree.controller';
import { AccountModule } from "../account/account.module";
import { ClassesModule } from "../classes/classes.module";
import { GroupModule } from "../group/group.module";
import { TypesModule } from "../types/types.module";
import { ClashflowModule } from 'src/clashflow/clashflow.module';
import { WithHoldingTaxModule } from 'src/with-holding-tax/with-holding-tax.module';
import { SaleTaxModule } from 'src/sale-tax/sale-tax.module';
@Module({
  imports: [
    AccountModule,
    ClassesModule,
    GroupModule,
    TypesModule,
    ClashflowModule,
    WithHoldingTaxModule,
    SaleTaxModule
  ],
  providers: [AccountTreeService],
  controllers: [AccountTreeController]
})
export class AccountTreeModule {}
