import { Module } from '@nestjs/common';
import { Account } from 'src/account/account.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountModule } from 'src/account/account.module';
import { ExpenseCategory } from './expense-category.model';
import { ExpenseCategoryController } from './expense-category.controller';
import { ExpenseCategoryService } from './expense-category.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ExpenseCategory, Account]),
    AccountModule,
  ],
  providers: [ExpenseCategoryService],
  controllers: [ExpenseCategoryController],
})
export class ExpenseCategoryModule {}
