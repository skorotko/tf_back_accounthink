import { Module } from '@nestjs/common';
import { ItemsContactsService } from './items-contacts.service';
import { ItemsContactsController } from './items-contacts.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemsContacts } from './items-contacts.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ItemsContacts
    ]),
  ],
  providers: [ItemsContactsService],
  controllers: [ItemsContactsController]
})
export class ItemsContactsModule {}
