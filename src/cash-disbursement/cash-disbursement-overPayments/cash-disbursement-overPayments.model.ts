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

interface CashDisbursementOverPaymentsModelAttrs {
  cashDisbursementHeaderIdIn: number;
  cashDisbursementHeaderIdOut: number;
  overpmtcr: number;
  date: number;
  amtApplied: number;
  owing: number;
  cdid: string;
  companyId: number;
  createdBy: number;
}

@Table({ tableName: 'cashDisbursementOverPayment' })
export class CashDisbursementOverPaymentsModel extends Model<
  CashDisbursementOverPaymentsModel,
  CashDisbursementOverPaymentsModelAttrs
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
    description: 'linked to cashdisbursementheader table',
  })
  @ForeignKey(() => CashDisbursementHeaderModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  cashDisbursementHeaderIdIn: number;

  @ApiProperty({
    example: '1',
    description: 'linked to cashdisbursementheader table',
  })
  @ForeignKey(() => CashDisbursementHeaderModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  cashDisbursementHeaderIdOut: number;

  @ApiProperty({ example: 'Inventory', description: 'cdid' })
  @Column({ type: DataType.STRING, allowNull: true })
  cdid: string;

  @ApiProperty({ example: '08.08.2021', description: 'applied date' })
  @Column({ type: DataType.DATE, allowNull: true })
  date: number;

  @ApiProperty({ example: '1', description: 'owing' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get owing(): number {
    return this.getDataValue('owing');
  }
  set owing(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('owing', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'overpmtcr' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get overpmtcr(): number {
    return this.getDataValue('overpmtcr');
  }
  set overpmtcr(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('overpmtcr', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({ example: '1', description: 'amtApplied' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amtApplied(): number {
    return this.getDataValue('amtApplied');
  }
  set amtApplied(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amtApplied', Number(value.toFixed(8)));
  }

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
  static async checkBeforeUpdate(instance: CashDisbursementOverPaymentsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: CashDisbursementOverPaymentsModel) {
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
