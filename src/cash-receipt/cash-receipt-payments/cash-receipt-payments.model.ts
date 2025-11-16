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
import { CashReceiptHeaderModel } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.model';

interface CashReceiptPaymentsModelAttrs {
  cashReceiptHeaderId: number;
  receivedDate: number;
  paymentMethodId: number;
  depositAccountId: number;
  chequeRefNo: string;
  dateOfCheque: Date;
  chequeIssueDate: Date;
  chequeIssuedBy: number;
  amountReceived: number;
  balanceToReceived: number;
  paymentStatus: string;
  companyId: number;
  createdBy: number;
  foreignAmountReceived: number;
  paymentCurrency: string;
}

@Table({ tableName: 'cashReceiptPayment' })
export class CashReceiptPaymentsModel extends Model<
  CashReceiptPaymentsModel,
  CashReceiptPaymentsModelAttrs
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
    description: 'linked to cashreceiptheader table',
  })
  @ForeignKey(() => CashReceiptHeaderModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  cashReceiptHeaderId: number;

  @ApiProperty({ example: '08.08.2021', description: 'received date' })
  @Column({ type: DataType.DATE, allowNull: true })
  receivedDate: number;

  @ApiProperty({ example: '1', description: 'selected payment id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  paymentMethodId: number;

  @ApiProperty({ example: '1', description: 'selected deposit account' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  depositAccountId: number;

  @ApiProperty({ example: 'Inventory', description: 'cheque/reference no' })
  @Column({ type: DataType.STRING, allowNull: true })
  chequeRefNo: string;

  @ApiProperty({ example: '08.08.2021', description: 'date of cheque' })
  @Column({ type: DataType.DATE, allowNull: true })
  dateOfCheque: number;

  @ApiProperty({ example: '08.08.2021', description: 'cheue issue date' })
  @Column({ type: DataType.DATE, allowNull: true })
  chequeIssueDate: number;

  @ApiProperty({ example: '1', description: 'cheque issued by' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  chequeIssuedBy: number;

  @ApiProperty({
    example: '1',
    description:
      'converted amount received based on client currency and foreign exchange',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get foreignAmountReceived(): number {
    return this.getDataValue('foreignAmountReceived');
  }
  set foreignAmountReceived(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('foreignAmountReceived', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: 'Inventory',
    description: 'currency of the amount received',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentCurrency: string;

  @ApiProperty({ example: '1', description: 'amount received' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amountReceived(): number {
    return this.getDataValue('amountReceived');
  }
  set amountReceived(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountReceived', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description: 'amountOwing from cashReceiptHeader table-amountReceived',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get balanceToReceived(): number {
    return this.getDataValue('balanceToReceived');
  }
  set balanceToReceived(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('balanceToReceived', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({
    example: '1',
    description: 'amountOwing from cashReceiptHeader table-amountReceived',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  balanceToReceivedFractionPart: number;

  @ApiProperty({ example: 'Inventory', description: 'payment Status' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentStatus: string;

  // @ApiProperty({example: '1', description: 'selected user' })
  // @Column({ type: DataType.INTEGER, allowNull: true })
  // receivedBy: number;

  @ApiProperty({ example: '1', description: 'current company id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number;

  @ApiProperty({
    example: '1',
    description: 'user id number who added the cash receipt',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'date created the cash receipt',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  @CreatedAt
  createDate: Date;

  @ApiProperty({
    example: '1',
    description: 'user id number who update the cas receipt',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  updateDatedBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'date updated the cash receipt',
  })
  @Column({ type: DataType.DATE, allowNull: true })
  @UpdatedAt
  updateDate: Date;

  @BeforeUpdate
  static async checkBeforeUpdate(instance: CashReceiptPaymentsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: CashReceiptPaymentsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BelongsTo(() => CashReceiptHeaderModel, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  cashReceiptHeaderModel: CashReceiptHeaderModel;
}
