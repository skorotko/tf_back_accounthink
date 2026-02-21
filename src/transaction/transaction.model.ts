import {
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { TransactionEntry } from '../transaction-entry/transaction-entry.model';
import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/account.model';
import { CashReceiptHeaderModel } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.model';
import { CashDisbursementHeaderModel } from 'src/cash-disbursement/cash-disbursement-header/cash-disbursement-header.model';

interface TransactionCreateAttrs {
  id?: number;
  transactionId: number;
  transactionCode: string;
  transactionType: string;
  transactionNo: string;
  transactionDate: number | Date;
  transactionCurrency: string;
  foreignCurrency: string;
  transactionDescription: string;
  isPosted: boolean;
  postedDate: Date | number;
  createdBy: number;
  createdDate: Date | number;
  recorderBy: any;
  recorderDate: any;
  accountId: number | null;
  companyId: number;
  amount: number;
  foreignAmount: any;
  exchangeRate: any;
  taxTypeId: number;
  reference: any;
}

@Table({ tableName: 'transaction', createdAt: false, updatedAt: false })
export class Transaction extends Model<Transaction, TransactionCreateAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  //1 - openBalance
  //2 - allocation openBalance
  //3 - general entries
  @ApiProperty({
    example: '1',
    description: 'Unique transaction identification number',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  transactionId: number;

  @ApiProperty({ example: '1', description: 'Company identification' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  companyId: number;

  @ApiProperty({
    example: '1',
    description:
      'Assigned Account identification number pertaining to account, refer the account table above',
  })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ApiProperty({
    example: 'GENERAL',
    description:
      'Default transaction code of books of account for all opening balance transactions',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  transactionCode: string;

  @ApiProperty({ example: 1, description: 'Transaction tax type id' })
  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
  taxTypeId: number;

  @ApiProperty({
    example: 'GENERAL',
    description: 'Default transaction type for all opening balance transaction',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  transactionType: string;

  @ApiProperty({
    example: 'GJ0001',
    description:
      'Formatted trasaction auto-nunber for all GeneralJournal transactions. GJ+series number based on the last number',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  transactionNo: string;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  transactionDate: number;

  @ApiProperty({ example: '08.08.2021', description: '...' })
  @Column({ type: DataType.DATE, allowNull: true })
  documentDate: number;

  @ApiProperty({
    example: 'PHP',
    description: 'Get the currency name of the account',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  transactionCurrency: string;

  @ApiProperty({
    example: 'PHP',
    description: 'Get the currency name of the account',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  foreignCurrency: string;

  @ApiProperty({ example: 'Ref', description: '...' })
  @Column({ type: DataType.STRING, allowNull: true })
  reference: string;

  @ApiProperty({ example: 'Ref', description: '...' })
  @Column({ type: DataType.STRING, allowNull: true })
  sourceReference: string;

  @ApiProperty({
    example: 'Opening Balance for Check No 0000123 account',
    description:
      'Optional transaction description, depends on the encoder if he/she puts detail in this column',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  transactionDescription: string;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isPosted: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isVoid: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeleted: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isReverse: boolean;

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  isReverseCronDate: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  postedDate: number;

  @ApiProperty({
    example: '1',
    description: 'User id who created the opening balance of an account',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  createdBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  createdDate: number;

  @ApiProperty({
    example: '1',
    description: 'User id who updates the opening balance of an account',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  updatedBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedDate: number;

  @ApiProperty({ example: '1', description: '...' })
  @Column({ type: DataType.STRING, allowNull: true })
  checkedBy: number;

  @ApiProperty({ example: '08.08.2021', description: '...' })
  @Column({ type: DataType.DATE, allowNull: true })
  checkedDate: number;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
  isSendToAcc: boolean;

  @ApiProperty({ example: '08.08.2021', description: '...' })
  @Column({ type: DataType.DATE, allowNull: true })
  sendToAccDate: number;

  @ApiProperty({ example: '1', description: '...' })
  @Column({ type: DataType.STRING, allowNull: true })
  recorderBy: number;

  @ApiProperty({ example: '08.08.2021', description: '...' })
  @Column({ type: DataType.DATE, allowNull: true })
  recorderDate: number;

  @ApiProperty({ example: '1', description: 'Assigned amount of the account' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amount', Number(value.toFixed(8)));
  }
  //amount: number;

  @ApiProperty({
    example: '1',
    description: 'Assigned foreign amount of the account',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set foreignAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('foreignAmount', Number(value.toFixed(8)));
  }
  //foreignAmount: number;

  @Column(DataType.VIRTUAL)
  get status() {
    let isDeleted: any = this.getDataValue('isDeleted');
    let isVoid: any = this.getDataValue('isVoid');
    let isReverse: any = this.getDataValue('isReverse');
    let postedDate: any = this.getDataValue('postedDate');
    let checkedDate: any = this.getDataValue('checkedDate');
    let recorderDate: any = this.getDataValue('recorderDate');

    if (isDeleted == true) {
      return 'Deleted';
    } else if (isVoid == true) {
      return 'Voided';
    } else if (isReverse == true) {
      return 'Reversed';
    } else if (postedDate && !checkedDate && !recorderDate) {
      return 'Added';
    } else if (postedDate && checkedDate && !recorderDate) {
      return 'Checked';
    } else {
      return 'Recorded';
    }
  }

  @ApiProperty({ example: '1', description: 'Exchange rate of the account' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  // set exchangeRate(value: number) {
  //   const amount = this.amount;
  //   const foreignAmount = this.foreignAmount;
  //   const exchangeRate = Number((foreignAmount / amount).toFixed(4));
  //   this.setDataValue('exchangeRate', exchangeRate);
  // }
  exchangeRate: number;

  @BeforeUpdate
  static async checkBeforeUpdate(instance: Transaction) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: Transaction) {
    if (instance.isBlock) {
      return false;
    }
  }

  @HasMany(() => TransactionEntry)
  transactionEntry: TransactionEntry[];

  @BelongsTo(() => Account)
  account: Account;

  // @BelongsTo(() => CashReceiptHeaderModel)
  // cashReceiptHeader: CashReceiptHeaderModel;

  @HasOne(() => CashReceiptHeaderModel)
  cashReceiptHeader: CashReceiptHeaderModel;

  @HasOne(() => CashDisbursementHeaderModel)
  cashDisbursement: CashDisbursementHeaderModel;
}
