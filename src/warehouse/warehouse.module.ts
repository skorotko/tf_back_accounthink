import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Warehouse} from "./warehouse.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Warehouse
    ])
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [
    WarehouseService
  ]
})
export class WarehouseModule {}
