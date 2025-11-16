import { Module } from '@nestjs/common';
import { ItemsUnitsService } from './items-units.service';
import { ItemsUnitsController } from './items-units.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { ItemsUnits } from "./items-units.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsUnits
    ]),
  ],
  providers: [ItemsUnitsService],
  controllers: [ItemsUnitsController],
  exports: [ItemsUnitsService]
})
export class ItemsUnitsModule {}
