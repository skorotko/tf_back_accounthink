import { Module } from '@nestjs/common';
import { TaxTypeController } from './tax-type.controller';
import { TaxTypeService } from './tax-type.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { TaxType } from "./tax-type.model";
import { TypesModule } from "../types/types.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      TaxType
    ]),
    TypesModule
  ],
  controllers: [TaxTypeController],
  providers: [TaxTypeService],
  exports: [TaxTypeService]
})
export class TaxTypeModule {}
