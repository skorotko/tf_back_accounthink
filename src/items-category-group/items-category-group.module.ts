import { Module } from '@nestjs/common';
import { ItemsCategoryGroupService } from './items-category-group.service';
import { ItemsCategoryGroupController } from './items-category-group.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemsCategoryGroup } from './items-category-group.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsCategoryGroup
    ]),
  ],
  providers: [ItemsCategoryGroupService],
  controllers: [ItemsCategoryGroupController],
  exports: [ItemsCategoryGroupService]
})
export class ItemsCategoryGroupModule {}
