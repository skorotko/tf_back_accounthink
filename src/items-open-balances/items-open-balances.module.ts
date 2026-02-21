import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountModule } from 'src/account/account.module';
import { ItemsModule } from 'src/items/items.module';
import { TransactionEntryModule } from 'src/transaction-entry/transaction-entry.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WarehouseModule } from 'src/warehouse/warehouse.module';
import { ItemsOpenBalancesController } from './items-open-balances.controller';
import { ItemsOpenBalancesService } from './items-open-balances.service';
import { ItemsOpenBalancesDetails } from './models/items-open-balances-details.model';
import { ItemsOpenBalancesHeader } from './models/items-open-balances-header.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsOpenBalancesHeader,
      ItemsOpenBalancesDetails
    ]),
    TransactionEntryModule,
    TransactionModule,
    AccountModule,
    ItemsModule,
    WarehouseModule
  ],
  controllers: [ItemsOpenBalancesController],
  providers: [ItemsOpenBalancesService],
  exports: [ItemsOpenBalancesService]
})
export class ItemsOpenBalancesModule { }
