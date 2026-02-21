import { Module } from '@nestjs/common';
import { ItemsCategoriesService } from './items-categories.service';
import { ItemsCategoriesController } from './items-categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemsCategories } from './items-categories.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsCategories
    ]),
  ],
  providers: [ItemsCategoriesService],
  controllers: [ItemsCategoriesController]
})
export class ItemsCategoriesModule {}
