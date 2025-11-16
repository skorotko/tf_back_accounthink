import { Module } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize";
import { Group } from "./group.model";
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Group
    ])
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [
    GroupService,
  ]
})
export class GroupModule {}
