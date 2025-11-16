import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { Group } from "../group/group.model";
import { ApiProperty } from "@nestjs/swagger";
import { Clashflow } from "../clashflow/clashflow.model";
import { Transaction } from 'src/transaction/transaction.model';
import { BankAccount } from 'src/bank-account/bank-account.model';
import { CreditCardAccount } from 'src/credit-card-account/credit-card-account.model';
import { TransactionEntry } from 'src/transaction-entry/transaction-entry.model';
import {SaleTax} from "../sale-tax/sale-tax.model";
import {WithHoldingTax} from "../with-holding-tax/with-holding-tax.model";
import { UserAccount } from './user-account.model';
import { ExpenseCategory } from 'src/expense-category/expense-category.model';
import { ExpendituresQueue } from 'src/expenditures-queue/expenditures-queue.model';


interface AccountCreateAttrs {
  code: string;
  name: string;
  groupId: number;
  DRCRCode: string;
  currencyId: number;
  clashflowId: number;
  accountCurrencyId: number;
  active: boolean;
  taxId: any;
  isBankAccount: boolean;
  isCreditCardAccount: boolean;
  companyId: number;
  defaultId: number;
  filePath: string;
  show?: boolean
}

@Table({ tableName: 'accounts', createdAt: false, updatedAt: false })
export class Account extends Model<Account, AccountCreateAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: '1', description: 'Default id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  defaultId: number;

  @ApiProperty({ example: '1', description: 'Default group id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  defaultGroupId: number;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  indelible: boolean;

  @ApiProperty({ example: 'account', description: 'Entity type name' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'account' })
  entityType: string;

  @ApiProperty({
    example: '1',
    description: 'Unique company identification number',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  companyId: number;

  @ApiProperty({ example: '1', description: 'Identification group' })
  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, allowNull: false })
  groupId: number;

  @ApiProperty({
    example: '1',
    description: 'Parent account identification number',
  })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  parentId: number;

  @ApiProperty({
    example: 1,
    description: 'System currency identification number',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  currencyId: number;

  @ApiProperty({ example: 1, description: 'Bank identification number' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  bankId: number;

  @ApiProperty({ example: 1, description: 'Credit card identification number' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  CCId: number;

  @ApiProperty({ example: 1, description: 'Tax identification number' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  taxId: number;

  @ApiProperty({ example: 1, description: 'Tax type identification number' }) //type 1 -
  @Column({ type: DataType.INTEGER, allowNull: true })
  taxTypeId: number;

  //@ApiProperty({ example: 1, description: 'Tax type identification number' }) //type 1 -
  @Column({ type: DataType.INTEGER, allowNull: false })
  accountTypeId: number;

  @ApiProperty({
    example: 1,
    description: 'Account identification number assignt to tax account',
  })
  //@ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  assignToTaxAccountId: number;

  @ApiProperty({
    example: 1,
    description: 'User currency identification number',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountCurrencyId: number;

  @ApiProperty({ example: '1.1.1', description: 'Unique code' })
  @Column({ type: DataType.STRING, allowNull: false })
  code: string;

  @ApiProperty({ example: 'Inventory', description: 'Account name' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  number: string;

  @ApiProperty({
    example: 'DR',
    description: 'Has one of two meanings "DR" or "CR"',
  })
  @Column({ type: DataType.ENUM({ values: ['DR', 'CR'] }), allowNull: false })
  DRCRCode: string;

  @ApiProperty({ example: 'true', description: 'Account active status' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true, allowNull: false })
  active: boolean;

  @ApiProperty({ example: 'true', description: 'Account close status' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  close: boolean;

  @ApiProperty({
    example: 'true',
    description: 'True if account is bank account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBankAccount: boolean;

  @ApiProperty({
    example: 'true',
    description: 'True if account is credit card account account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isCreditCardAccount: boolean;

  @ApiProperty({
    example: 'This is account',
    description: 'Account description',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @ApiProperty({ description: 'Remark for account' })
  @Column({ type: DataType.STRING, allowNull: true })
  remarks: string;

  @ApiProperty({})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  noTax: boolean;

  @ApiProperty({})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  zeroTax: boolean;

  @ApiProperty({})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  noTaxSP: boolean;

  @ApiProperty({})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  show: boolean;

  @ApiProperty({})
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  exemptTax: boolean;

  @ApiProperty({ example: '1', description: 'Identification clashflow' })
  @ForeignKey(() => Clashflow)
  @Column({ type: DataType.INTEGER, allowNull: true })
  clashflowId: number;

  @ApiProperty({ example: 'admin', description: 'Who created' })
  @Column({ type: DataType.STRING, allowNull: true })
  createdBy: number;

  @ApiProperty({ example: 'admin', description: 'Who made the update' })
  @Column({ type: DataType.STRING, allowNull: true })
  updatedBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'Date of creation' })
  @Column({ type: DataType.DATE, allowNull: true })
  createdDate: number;

  @ApiProperty({ example: '08.08.2021', description: 'Update date' })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedDate: number;

  @Column({ type: DataType.STRING, allowNull: false })
  filePath: string;

  @BelongsTo(() => Group)
  group: Group;

  // @HasMany(() => Account)
  // childAccount: Account;

  @BelongsTo(() => Account)
  parentAccount: Account;

  // @HasMany(() => Account)
  // taxAccount: Account;

  @HasMany(() => Transaction)
  transaction: Transaction;

  @HasMany(() => ExpenseCategory)
  expenseCategory: ExpenseCategory;

  @HasMany(() => ExpendituresQueue)
  expendituresQueue: ExpendituresQueue;

  @HasMany(() => TransactionEntry)
  transactionEntry: TransactionEntry[];

  @HasOne(() => BankAccount)
  bankAccount: BankAccount;

  @HasOne(() => UserAccount)
  userAccount: UserAccount;

  @HasOne(() => CreditCardAccount)
  creditCardAccount: CreditCardAccount;
  tax?: SaleTax | WithHoldingTax;
  accountTypeName: string;
  clashflowObj: any;
  nameTax: any;
  codeTax: any;
}
