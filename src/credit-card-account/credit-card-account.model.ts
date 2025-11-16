import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Account } from "../account/account.model";
import { ApiProperty } from "@nestjs/swagger";

interface CreditCardAccountCreateAttrs {
  accountId: number;
  createdBy: number;
  createdDate: number;
}

@Table({ tableName: 'creditCardAccounts', createdAt: false, updatedAt: false })
export class CreditCardAccount extends Model<CreditCardAccount, CreditCardAccountCreateAttrs>{
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: '1', description: 'Account id' })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ApiProperty({ example: '100000000', description: 'credit Limit' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set creditLimit(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value))
      value = 0;
    this.setDataValue('creditLimit', Number((value).toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'Reconciliation days' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  reconciliationDays: number;

  @ApiProperty({ example: '08.08.2021', description: 'Reconciliation StartDate' })
  @Column({ type: DataType.DATE, allowNull: true })
  reconciliationStartDate: number;

  @ApiProperty({ example: 'Inventory', description: 'Financial Institution' })
  @Column({ type: DataType.STRING, allowNull: true })
  financialInstitution: string;

  @ApiProperty({ example: 'Inventory@mail.com', description: 'Website' })
  @Column({ type: DataType.STRING, allowNull: true })
  website: string;

  @ApiProperty({ example: '312343244123', description: 'IBAN' })
  @Column({ type: DataType.STRING, allowNull: true })
  IBAN: string;

  @ApiProperty({ example: '312343244123', description: 'Card Number' })
  @Column({ type: DataType.STRING, allowNull: true })
  cardNumber: string;

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
}
