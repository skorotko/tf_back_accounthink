import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Account } from "../account/account.model";
import { ApiProperty } from "@nestjs/swagger";
import { BankAccountType } from 'src/bank-account-type/bank-account-type.model';
import { SaleTax } from 'src/sale-tax/sale-tax.model';


interface BankAccountCreateAttrs {
  accountId: number;
  createdBy: number;
  createdDate: number;
}

@Table({ tableName: 'bankAccounts', createdAt: false, updatedAt: false })
export class BankAccount extends Model<BankAccount, BankAccountCreateAttrs>{
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: '1', description: 'Payment method id' })
  @ForeignKey(() => BankAccountType)
  @Column({ type: DataType.INTEGER, allowNull: true })
  paymentMethodId: number;

  @ApiProperty({ example: '1', description: 'Account id' })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ApiProperty({ example: '1', description: 'Business unit id' })
  //@ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  buId: number;

  @ApiProperty({ example: '1', description: 'Business unit user id' })
  //@ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  buUserId: number;

  @ApiProperty({ example: '1', description: 'Tax code id' })
  @ForeignKey(() => SaleTax)
  @Column({ type: DataType.INTEGER, allowNull: true })
  taxCodeId: number;

  // @ApiProperty({example: '100000000', description: 'Open Balance'})
  // @Column({ type: DataType.INTEGER, allowNull: true})
  // openingBalance: number;

  @ApiProperty({ example: '100000000', description: 'Current Balance' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set currentBalance(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value))
      value = 0;
    this.setDataValue('currentBalance', Number((value).toFixed(8)));
  }

  @ApiProperty({ example: '100000000', description: 'Over Draft Limit' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set overDraftLimit(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value))
      value = 0;
    this.setDataValue('overDraftLimit', Number((value).toFixed(8)));
  }


  @ApiProperty({ example: '1', description: 'Reconciliation days' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  reconciliationDays: number;

  @ApiProperty({ example: '08.08.2021', description: 'Reconciliation StartDate' })
  @Column({ type: DataType.DATE, allowNull: true })
  reconciliationStartDate: number;

  @ApiProperty({ example: 'true', description: 'Allow Balancing Transaction active status' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  allowBalancingTransaction: boolean;

  @ApiProperty({ example: 'Inventory', description: 'Financial Institution' })
  @Column({ type: DataType.STRING, allowNull: true })
  financialInstitution: string;

  @ApiProperty({ example: 'Inventory@mail.com', description: 'Website' })
  @Column({ type: DataType.STRING, allowNull: true })
  website: string;

  @ApiProperty({ example: '312343244123', description: 'IBAN' })
  @Column({ type: DataType.STRING, allowNull: true })
  IBAN: string;

  @ApiProperty({ example: '1', description: 'Bank Account Type id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  bankAccountTypeID: number;

  @ApiProperty({ example: '312343244123', description: 'Bank Swift Code' })
  @Column({ type: DataType.STRING, allowNull: true })
  bankSwiftCode: string;

  @ApiProperty({ example: '312343244123', description: 'Bank Code' })
  @Column({ type: DataType.STRING, allowNull: true })
  bankCode: string;

  @ApiProperty({ example: '312343244123', description: 'Account Number' })
  @Column({ type: DataType.STRING, allowNull: true })
  accountNumber: string;

  @ApiProperty({ example: 'Oleg', description: 'Bank Manager Name' })
  @Column({ type: DataType.STRING, allowNull: true })
  bankManagerName: string;

  @ApiProperty({ example: 'Inventory@mail.com', description: 'Bank Manager Email' })
  @Column({ type: DataType.STRING, allowNull: true })
  bankManagerEmail: string;

  @ApiProperty({ example: '0002000', description: 'Bank Manager Phone' })
  @Column({ type: DataType.STRING, allowNull: true })
  bankManagerPhone: string;

  @ApiProperty({ example: '0002000', description: 'Bank Manager Fax' })
  @Column({ type: DataType.STRING, allowNull: true })
  BankManagerFax: string;

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

  @BelongsTo(() => Account)
  account: Account;

  @BelongsTo(() => SaleTax)
  taxCode: SaleTax;

  @BelongsTo(() => BankAccountType)
  type: BankAccountType;
}
