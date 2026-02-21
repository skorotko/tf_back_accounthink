import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Types } from "./types.model";
import { TypesController } from './types.controller';
import { TypesService } from './types.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Types
    ])
  ],
  controllers: [TypesController],
  providers: [TypesService],
  exports: [
    TypesService,
  ]
})
export class TypesModule {}
