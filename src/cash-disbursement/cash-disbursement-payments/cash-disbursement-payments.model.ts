import {
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CashDisbursementHeaderModel } from '../cash-disbursement-header/cash-disbursement-header.model';

interface CashDisbursementPaymentsModelAttrs {
  cashDisbursementHeaderId: number;
  paidDate: number;
  paymentMethodId: number;
  depositAccountId: number;
  chequeRefNo: string;
  dateOfCheque: Date;
  chequeIssueDate: Date;
  chequeIssuedBy: number;
  amountPaid: number;
  balanceToReceived: number;
  paymentStatus: string;
  companyId: number;
  createdBy: number;
  foreignAmountPaid: number;
  paymentCurrency: string;
}

@Table({ tableName: 'cashDisbursementPayment' })
export class CashDisbursementPaymentsModel extends Model<
  CashDisbursementPaymentsModel,
  CashDisbursementPaymentsModelAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({
    example: '1',
    description: 'linked to cashDisbursementheader table',
  })
  @ForeignKey(() => CashDisbursementHeaderModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  cashDisbursementHeaderId: number;

  @ApiProperty({ example: '08.08.2021', description: 'paid date' })
  @Column({ type: DataType.DATE, allowNull: true })
  paidDate: number;

  @ApiProperty({ example: '1', description: 'selected payment id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  paymentMethodId: number;

  @ApiProperty({ example: '1', description: 'selected deposit account' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  depositAccountId: number;

  @ApiProperty({ example: 'Inventory', description: 'cheque/reference no' })
  @Column({ type: DataType.STRING, allowNull: true })
  chequeRefNo: string;

  @ApiProperty({ example: 'Inventory', description: 'paymentCurrency' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentCurrency: string;

  @ApiProperty({ example: '08.08.2021', description: 'date of cheque' })
  @Column({ type: DataType.DATE, allowNull: true })
  dateOfCheque: number;

  @ApiProperty({ example: '08.08.2021', description: 'cheue issue date' })
  @Column({ type: DataType.DATE, allowNull: true })
  chequeIssueDate: number;

  @ApiProperty({ example: '1', description: 'cheque issued by' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  chequeIssuedBy: number;

  @ApiProperty({ example: '1', description: 'amount paid' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set foreignAmountPaid(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('foreignAmountPaid', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get foreignAmountPaidModifObj() {
    const original = this.getDataValue('foreignAmountPaid');
    return {
      original,
    };
  }

  @ApiProperty({ example: '1', description: 'amount paid' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amountPaid(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountPaid', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountPaidModifObj() {
    const original = this.getDataValue('amountPaid');
    return {
      original,
    };
  }

  @ApiProperty({
    example: '1',
    description: 'amountOwing from cashDisbursementHeader table-amountReceived',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set balanceToReceived(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('balanceToReceived', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get balanceToReceivedModifObj() {
    const original = this.getDataValue('balanceToReceived');
    return {
      original,
    };
  }

  @ApiProperty({ example: 'Inventory', description: 'payment Status' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentStatus: string;

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  // @ApiProperty({example: '1', description: 'selected user' })
  // @Column({ type: DataType.INTEGER, allowNull: true })
  // receivedBy: number;

  @ApiProperty({ example: '1', description: 'current company id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number;

  @ApiProperty({
    example: '1',
    description: 'user id number who added the cash Disbursement',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'date created the cash Disbursement',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  @CreatedAt
  createDate: Date;

  @ApiProperty({
    example: '1',
    description: 'user id number who update the cas Disbursement',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  updateDatedBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'date updated the cash Disbursement',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  @UpdatedAt
  updateDate: Date;

  @BeforeUpdate
  static async checkBeforeUpdate(instance: CashDisbursementPaymentsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: CashDisbursementPaymentsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BelongsTo(() => CashDisbursementHeaderModel, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  cashDisbursementHeaderModel: CashDisbursementHeaderModel;
}
