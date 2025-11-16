import { Module } from '@nestjs/common';
import { BankAccountTypeController } from './bank-account-type.controller';
import { BankAccountType } from './bank-account-type.model';
import { BankAccountTypeService } from './bank-account-type.service';
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
	imports: [
		SequelizeModule.forFeature([
			BankAccountType
		])
	],
 	controllers: [BankAccountTypeController],
  	providers: [BankAccountTypeService]
})
export class BankAccountTypeModule {}
