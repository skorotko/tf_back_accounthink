import { HttpException, Injectable } from '@nestjs/common';
import { ExpenseCategory } from './expense-category.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateExpenseCategoryDto} from './dto/CreateExpenseCategoryDto.dto';
import { AccountService } from 'src/account/account.service';
import { Account } from 'src/account/account.model';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectModel(ExpenseCategory)
    private expenseCategoryRepository: typeof ExpenseCategory,
    private accountService: AccountService,
  ) {}

  async create(dto: CreateExpenseCategoryDto) {
    return await this.expenseCategoryRepository.create(dto);
  }

  // Отримання списку за companyId
  async list(companyId: number) {
    return await this.expenseCategoryRepository.findAll({
      where: {
        companyId
      },
      include: [
        {
          model: Account
        }
      ]
    });
  }

  // Отримання однієї категорії за id
  async findOneById(id: number) {
    return await this.expenseCategoryRepository.findOne({
      where: {
        id,
      },
    });
  }

  // Оновлення категорії за id
  async update(id: number, dto: CreateExpenseCategoryDto) {
    const expenseCategory = await this.expenseCategoryRepository.findByPk(id);
    if (!expenseCategory) throw new HttpException('Not Found!', 400);
    return await expenseCategory.update(dto);
  }

  // Видалення категорії за id
  async delete(id: number) {
    return await this.expenseCategoryRepository.destroy({
      where: {
        id,
      },
    });
  }
}
