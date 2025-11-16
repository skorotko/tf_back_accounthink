import {
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Transaction } from '../transaction/transaction.model';
import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/account.model';

interface TransactionEntryCreateAttrs {
  transactionId: number;
  accountId: number;
  DRCRCode: string;
  amount: number;
  endBalance: number;
  description: string;
  companyId: number;
  userId: number;
  entityTypeId: any;
  entityId: any;
  taskId: any;
  foreignAmount: any;
  exchangeRate: any;
  isTax: boolean;
  taxAssignAccountId: any;
  createdBy: number;
  createdDate: number;
  trAccountCode: string | null;
  trTaxCode: string | null;
  VatRCheked: boolean;
  itemId: number;
  VatRCheckedDate: number;
  VatRCheckedBy: number;
  VatRApplicableMonth: number;
}

@Table({ tableName: 'transactionEntry', createdAt: false, updatedAt: false })
export class TransactionEntry extends Model<
  TransactionEntry,
  TransactionEntryCreateAttrs
> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '1',
    description:
      'Transaction identification number that links to transaction table on the above table',
  })
  @ForeignKey(() => Transaction)
  @Column({ type: DataType.INTEGER, allowNull: false })
  transactionId: number;

  @ApiProperty({
    example: '1',
    description:
      'Assigned Account identification number pertaining to account, refer the account table above',
  })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: false })
  accountId: number;

  @ApiProperty({
    example: '1',
    description: 'Assigned Account identification number for tax',
  })
  @ForeignKey(() => Account)
  @Column({ type: DataType.STRING, allowNull: true })
  taxAssignAccountId: number;

  @ApiProperty({ example: '1', description: 'Tr Account code for tax' })
  @Column({ type: DataType.STRING, allowNull: true })
  trAccountCode: string;

  @ApiProperty({ example: '1', description: 'Tr Tax code for account' })
  @Column({ type: DataType.STRING, allowNull: true })
  trTaxCode: string;

  @ApiProperty({
    example: 'DRCRCode',
    description: 'DRCRCode of the account, refer to the account table above',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  DRCRCode: string;

  @ApiProperty({
    example: '1',
    description: 'Assigned credit of the te details',
  })
  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  get endBalance(): number {
    return this.getDataValue('endBalance');
  }
  set endBalance(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('endBalance', Number(value.toFixed(8)));
  }

  // @Column(DataType.VIRTUAL)
  // get endBalanceObj() {
  //   const penny = Number(this.getDataValue('endBalance'));
  //   let float = (penny / 100).toFixed(2);
  //   const original = Number(float + this.getDataValue('endBalanceFractionPart'));
  //   const afterRate = Number((original * this.getDataValue('exchangeRate')).toFixed(2));
  //   return {
  //     original,
  //     afterRate,
  //     penny
  //   }
  // }

  @ApiProperty({ example: '1', description: 'Assigned amount of the account' })
  @Column({ type: DataType.FLOAT, allowNull: false })
  get amount(): number {
    return this.getDataValue('amount');
  }
  set amount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amount', Number(value.toFixed(8)));
  }

  // @Column(DataType.VIRTUAL)
  // get amountObj() {
  //   const penny = Number(this.getDataValue('amount'));
  //   let float = (penny / 100).toFixed(2);
  //   const original = Number(float + this.getDataValue('amountFractionPart'));
  //   const afterRate = Number((original * this.getDataValue('exchangeRate')).toFixed(2));
  //   return {
  //     original,
  //     afterRate,
  //     penny
  //   }
  // }

  @ApiProperty({
    example: '1',
    description: 'Assigned foreign amount of the account',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get foreignAmount(): number {
    return this.getDataValue('foreignAmount');
  }
  set foreignAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('foreignAmount', Number(value.toFixed(8)));
  }

  // @Column(DataType.VIRTUAL)
  // get foreignAmountObj() {
  //   const penny = Number(this.getDataValue('foreignAmount'));
  //   let float = (penny / 100).toFixed(2);
  //   const original = Number(float + this.getDataValue('foreignAmountFractionPart'));
  //   const afterRate = Number((original * this.getDataValue('exchangeRate')).toFixed(2));
  //   return {
  //     original,
  //     afterRate,
  //     penny
  //   }
  // }

  @ApiProperty({ example: '1', description: 'Exchange rate of the account' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  exchangeRate: number;

  @ApiProperty({
    example: 'Description',
    description: 'Fixed description: "Opening balance for "+AccountName',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @ApiProperty({ example: '1', description: 'Company identification' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  companyId: number;

  @ApiProperty({
    example: '1',
    description: 'Entity identification(proj/eng/bu)',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  entityId: number;

  @ApiProperty({
    example: '1',
    description: 'Entity type identification(proj/eng/bu)',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  entityTypeId: number;

  @ApiProperty({ example: '1', description: 'Business Unit identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  buId: number;

  @ApiProperty({ example: '1', description: 'ItemId identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  itemId: number;

  @ApiProperty({ example: '1', description: 'Employee identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  employeeId: number;

  @ApiProperty({ example: '1', description: 'Vendor identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  vendorId: number;

  @ApiProperty({ example: '1', description: 'Client identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  clientId: number;

  @ApiProperty({ example: '1', description: 'Allocated default UnAllocated' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'UnAllocated',
  })
  isAllocated: string;

  @ApiProperty({ example: '1', description: 'User identification' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ example: '1', description: 'Task identification' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  taskId: number;

  @ApiProperty({ example: '1', description: '...' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  BRID: number;

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  BRCheked: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  BRCleared: boolean;

  @ApiProperty({ example: false, description: 'Tax transaction or not' })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  isTax: boolean;

  @ApiProperty({ example: '1', description: '...' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  CCRID: number;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  CCRCheked: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  CCRCleared: boolean;

  @ApiProperty({ example: '1', description: '...' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  VatRID: number;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  VatRCheked: boolean;

  @ApiProperty({ example: false })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  VatRCleared: boolean;

  @ApiProperty({ example: '08.08.2021', description: 'VatRCheckedDate' })
  @Column({ type: DataType.DATE, allowNull: true })
  VatRCheckedDate: number;

  @ApiProperty({ example: '1', description: 'VatRCheckedBy' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  VatRCheckedBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'VatRUnCheckedDate' })
  @Column({ type: DataType.DATE, allowNull: true })
  VatRUnCheckedDate: number;

  @ApiProperty({ example: '1', description: 'VatRUnCheckedBy' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  VatRUnCheckedBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'VatRApplicableMonth' })
  @Column({ type: DataType.DATE, allowNull: true })
  VatRApplicableMonth: number;

  @ApiProperty({
    example: '1',
    description: 'User id who created the opening balance of an account',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  createdBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @BeforeUpdate
  static async checkBeforeUpdate(instance: TransactionEntry) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: TransactionEntry) {
    if (instance.isBlock) {
      return false;
    }
  }

  @Column({ type: DataType.DATE, allowNull: false })
  createdDate: number;

  @BelongsTo(() => Transaction)
  transaction: Transaction;

  @BelongsTo(() => Account)
  account: Account;
}
