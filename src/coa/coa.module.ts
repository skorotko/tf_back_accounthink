import { Module } from '@nestjs/common';
import { CoaService } from './coa.service';
import { CoaController } from './coa.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Classes } from 'src/classes/classes.model';
import { Group } from 'src/group/group.model';
import { Account } from 'src/account/account.model';
import { AccountingMethodMapping } from 'src/account/accountingMethodMapping.model';
import { Clashflow } from 'src/clashflow/clashflow.model';
import { Types } from 'src/types/types.model';
import { AccountType } from 'src/account/accountType.model';
import { SaleTax } from 'src/sale-tax/sale-tax.model';
import { WithHoldingTax } from 'src/with-holding-tax/with-holding-tax.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Classes,
      Group,
      Account,
      AccountingMethodMapping,
      Clashflow,
      Types,
      AccountType,
      SaleTax,
      WithHoldingTax,
    ]),
  ],
  providers: [CoaService],
  controllers: [CoaController],
})
export class CoaModule {}
