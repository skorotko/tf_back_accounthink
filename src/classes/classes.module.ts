import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Classes } from "./classes.model";
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Classes
    ])
  ],
  providers: [ClassesService],
  controllers: [ClassesController],
  exports: [
    ClassesService,
  ] 
})
export class ClassesModule {}
