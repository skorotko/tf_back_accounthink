import { Module } from '@nestjs/common';
import { ZeroTaxTypeController } from './zero-tax-type.controller';
import { ZeroTaxTypeService } from './zero-tax-type.service';
import { SequelizeModule } from "@nestjs/sequelize";
import { ZeroTaxType } from "./zero-tax-type.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ZeroTaxType
    ])
  ],
  controllers: [ZeroTaxTypeController],
  providers: [ZeroTaxTypeService],
  exports: [ZeroTaxTypeService]
})
export class ZeroTaxTypeModule {}
