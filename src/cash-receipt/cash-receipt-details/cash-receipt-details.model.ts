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

interface CashReceiptDetailsModelCreateAttrs {
  cashReceiptHeaderId: number;
  accountNumber: string;
  accountId: number;
  itemId: number;
  purchaseAccountId: number;
  inventoryAssetAccountId: number;
  discountAccountId: number;
  costPrice: number;
  warehouseId: number;
  details: string;
  unitPrice: number;
  unitId: number;
  qty: number;
  totalAmount: number;
  taxCodeId: number;
  taxRate: number;
  vatableAmount: number;
  vatExemptAmount: number;
  zeroRatedAmount: number;
  vatAmount: number;
  notaxAmount: number;
  isOtherRevenue: boolean;
  allocatedTo: number;
  buId: number;
  whsengproId: number;
  taskId: number;
  euId: number;
  companyId: number;
  createdBy: number;
  isClientWHTax: boolean;
  typeTable: string;
  discount: number;
  isNonRevenue: boolean;

  // isSCPWD: boolean;
  // scpwdDiscountRate: number;
  // discountAmount: number;
  // taxAmount: number;
  // vatableExcludingAmount: number;
  // vatableIncludingAmount: number;
}

@Table({ tableName: 'cashReceiptDetail' })
export class CashReceiptDetailsModel extends Model<
  CashReceiptDetailsModel,
  CashReceiptDetailsModelCreateAttrs
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

  @ApiProperty({ example: 'Inventory', description: 'db code' })
  @Column({ type: DataType.STRING, allowNull: true })
  accountNumber: string;

  @ApiProperty({ example: '1', description: 'selected revenue account' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ApiProperty({ example: '1', description: 'selected revenue item' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  itemId: number;

  @ApiProperty({ example: '1', description: 'selected discountAccountId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  discountAccountId: number;

  @ApiProperty({
    example: '1',
    description: 'selected inventoryAssetAccountId',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  inventoryAssetAccountId: number;

  @ApiProperty({ example: '1', description: 'selected purchaseAccountId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  purchaseAccountId: number;

  @ApiProperty({ example: '1', description: 'selected revenue warehouseId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  warehouseId: number;

  @ApiProperty({ example: 'Inventory', description: 'details' })
  @Column({ type: DataType.TEXT, allowNull: true })
  details: string;

  @ApiProperty({ example: 'Inventory', description: 'details' })
  @Column({ type: DataType.STRING, allowNull: true })
  typeTable: string;

  @ApiProperty({
    example: '1',
    description:
      '(unitPrice*qty)-applicable only to all Contra Account (like Sales Discounts, Sales Returns) in Revenue Accounts column',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get discount(): number {
    return this.getDataValue('discount');
  }
  set discount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('discount', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: 'true',
    description: 'tagging if the line item is a non revenue account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isNonRevenue: boolean;

  @ApiProperty({ example: '1', description: 'encoded costPrice' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get costPrice(): number {
    return this.getDataValue('costPrice');
  }
  set costPrice(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('costPrice', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'encoded unit price' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get unitPrice(): number {
    return this.getDataValue('unitPrice');
  }
  set unitPrice(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('unitPrice', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'selected unit' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  unitId: number;

  @ApiProperty({ example: '1', description: 'quantity' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  qty: number;

  @ApiProperty({ example: '1', description: 'computed total amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get totalAmount(): number {
    return this.getDataValue('totalAmount');
  }
  set totalAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('totalAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'selected taxcode' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  taxCodeId: number;

  @ApiProperty({
    example: '1',
    description: 'selected tax rate from selected tax code',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get taxRate(): number {
    return this.getDataValue('taxRate');
  }
  set taxRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('taxRate', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description:
      'if sales tax type is Including taxrate is not 0, totalAmount/(1+(taxRate/100)), if Excluding then totalAmount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get vatableAmount(): number {
    return this.getDataValue('vatableAmount');
  }
  set vatableAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatableAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description: 'if sales tax type is Tax Exempt, totalAmount else 0',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get vatExemptAmount(): number {
    return this.getDataValue('vatExemptAmount');
  }
  set vatExemptAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatExemptAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description: 'if taxCodeId is Zero-rated 0% then (total) else 0',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get zeroRatedAmount(): number {
    return this.getDataValue('zeroRatedAmount');
  }
  set zeroRatedAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('zeroRatedAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description:
      'if sales tax type is Including/Excluding and taxrate is not 0, vatableAmount*(taxRate/100)',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get vatAmount(): number {
    return this.getDataValue('vatAmount');
  }
  set vatAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'if selected taxcode is No Tax' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get notaxAmount(): number {
    return this.getDataValue('notaxAmount');
  }
  set notaxAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('notaxAmount', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({ example: 'true', description: 'this include whtax in client' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isClientWHTax: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if the account is other revenue',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isOtherRevenue: boolean;

  @ApiProperty({ example: '1', description: 'selected allocated to' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  allocatedTo: number;

  @ApiProperty({ example: '1', description: 'selected business unit' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  buId: number;

  @ApiProperty({
    example: '1',
    description: 'selected warehouse, engagement, project',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  whsengproId: number;

  @ApiProperty({ example: '1', description: 'selected task' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  taskId: number;

  @ApiProperty({ example: '1', description: 'slected employee id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  euId: number;

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
  static async checkBeforeUpdate(instance: CashReceiptDetailsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: CashReceiptDetailsModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  // @ApiProperty({ example: 'true', description: 'tagging if the line item apply sc/pwd discount' })
  // @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  // isSCPWD: boolean;

  // @ApiProperty({ example: '1', description: 'senior citizen/ pwd rate' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // scpwdDiscountRate: number;

  // @ApiProperty({ example: '1', description: 'selected discount rate' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // discountRate: number;

  // @ApiProperty({ example: '1', description: '(total*scpwdDiscountRate)' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // scpwdDiscountAmount: number;

  // @ApiProperty({ example: '1', description: '(total*discountRate)' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // discountAmount: number;

  // @ApiProperty({ example: '1', description: '(total*(taxrate/100))' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // taxAmount: number;

  // @ApiProperty({ example: '1', description: 'if sales tax is excluding vat then ((total+taxAmount)/(1+(taxRate/100))) else 0' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // vatableExcludingAmount: number;

  // @ApiProperty({ example: '1', description: 'if sales tax is including vat then (total) else 0' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // vatableIncludingAmount: number;

  // @ApiProperty({ example: '1', description: 'If taxCodeId is Exempt Sales/Receipts then (total) else 0' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // vatExAmount: number;

  @BelongsTo(() => CashReceiptHeaderModel, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  cashReceiptHeaderModel: CashReceiptHeaderModel;
}
