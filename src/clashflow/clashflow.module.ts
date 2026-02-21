import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Clashflow } from "./clashflow.model";
import { ClashflowService } from './clashflow.service';
import { ClashflowController } from './clashflow.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Clashflow
    ])
  ],
  providers: [ClashflowService],
  controllers: [ClashflowController],
  exports: [
    ClashflowService,
  ]
})
export class ClashflowModule {}
