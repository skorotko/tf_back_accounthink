import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { UserAccount } from 'src/account/user-account.model';
import { Account } from 'src/account/account.model';

interface ExpenseCategoryCreateAttrs {
  accountId: number;
  companyId: number;
  icon: string;
  name: string;
  description: string;
  tags: string;
}

@Table({ tableName: 'expense-categories', createdAt: false, updatedAt: false })
export class ExpenseCategory extends Model<
  ExpenseCategory,
  ExpenseCategoryCreateAttrs
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id',
  })
  id: number;

  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  icon: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  tags: string;

  // Ассоциации
  @BelongsTo(() => Account, 'accountId')
  account: Account;
}