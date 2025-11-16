import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemsController } from './items.controller';
import { Items } from './models/items.model';
import { ItemsService } from './items.service';
import { ItemsType } from "./models/items-type.model";
import { ItemsUnitsModule } from "../items-units/items-units.module";
import { ItemsGroup } from "./models/items-group.model";
import { ItemsWarehouse } from './models/items-warehouse.model';
import { ItemsTransaction } from './models/items-transaction.model';
import { WarehouseModule } from "../warehouse/warehouse.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Items,
      ItemsType,
      ItemsGroup,
      ItemsWarehouse,
      ItemsTransaction
    ]),
    ItemsUnitsModule,
    WarehouseModule
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService]
})
export class ItemsModule {}
