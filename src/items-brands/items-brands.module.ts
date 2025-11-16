import { Module } from '@nestjs/common';
import { ItemsBrandsService } from './items-brands.service';
import { ItemsBrandsController } from './items-brands.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { ItemsBrands } from "./items-brands.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsBrands
    ]),
  ],
  providers: [ItemsBrandsService],
  controllers: [ItemsBrandsController],
  exports: [ItemsBrandsService]
})
export class ItemsBrandsModule {}
