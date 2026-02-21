import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { CashDisbursementHeaderModel } from 'src/cash-disbursement/cash-disbursement-header/cash-disbursement-header.model';


interface CashDisbursementDetailsModelCreateAttrs {
  cashDisbursementHeaderId: number;
  accountNumber: string;
  accountId: number;
  discountAccountId: number;
  itemId: number;
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
  isOtherExpenditure: boolean;
  allocatedTo: number;
  buId: number;
  whsengproId: number;
  taskId: number;
  euId: number;
  companyId: number;
  createdBy: number;
  isVendorWHTax: boolean;
  itemNo: string;
  itemName: string;
  discount: number;
  isNonCost: boolean;
  typeTable: string;
  isOtherRevenue: boolean;
  // isSCPWD: boolean;
  // scpwdDiscountRate: number;
  // discountAmount: number;
  // taxAmount: number;
  // vatableExcludingAmount: number;
  // vatableIncludingAmount: number;
}

@Table({ tableName: 'cashDisbursementDetail' })
export class CashDisbursementDetailsModel extends Model<
  CashDisbursementDetailsModel,
  CashDisbursementDetailsModelCreateAttrs
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

  @ApiProperty({ example: 'true', description: 'this include whtax in vendor' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isVendorWHTax: boolean;

  @ApiProperty({ example: 'Inventory', description: 'db code' })
  @Column({ type: DataType.STRING, allowNull: true })
  accountNumber: string;

  @ApiProperty({ example: '1', description: 'selected revenue account' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  accountId: number;

  @ApiProperty({ example: '1', description: 'selected discountAccountId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  discountAccountId: number;

  @ApiProperty({ example: '1', description: 'selected revenue item' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  itemId: number;

  @ApiProperty({
    example: 'Inventory',
    description: 'item number of the selected item',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  itemNo: string;

  @ApiProperty({
    example: 'Inventory',
    description: 'item name of the selected item',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  itemName: string;

  @ApiProperty({ example: 'Inventory', description: 'typeTable' })
  @Column({ type: DataType.STRING, allowNull: true })
  typeTable: string;

  @ApiProperty({ example: 'true', description: 'isOtherRevenue' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isOtherRevenue: boolean;

  @ApiProperty({ example: '1', description: 'selected revenue warehouseId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  warehouseId: number;

  @ApiProperty({ example: 'Inventory', description: 'details' })
  @Column({ type: DataType.TEXT, allowNull: true })
  details: string;

  @ApiProperty({
    example: '1',
    description: 'sum of Discount Amount in cashReceiptDetail table',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get discount(): number {
    return this.getDataValue('discount');
  }
  set discount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('discount', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'encoded unit price' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set unitPrice(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('unitPrice', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get unitPriceModifObj() {
    const original = this.getDataValue('unitPrice');
    return {
      original,
    };
  }

  @ApiProperty({ example: '1', description: 'selected unit' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  unitId: number;

  @ApiProperty({ example: '1', description: 'quantity' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  qty: number;

  @ApiProperty({ example: '1', description: 'computed total amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set totalAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('totalAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get totalAmountModifObj() {
    const original = this.getDataValue('totalAmount');
    return {
      original,
    };
  }

  @ApiProperty({ example: '1', description: 'FractionPart' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  totalAmountFractionPart: number;
  //totalAmount: number;

  @ApiProperty({ example: '1', description: 'selected taxcode' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  taxCodeId: number;

  @ApiProperty({
    example: '1',
    description: 'selected tax rate from selected tax code',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set taxRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('taxRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get taxRateModifObj() {
    const original = this.getDataValue('taxRate');
    return {
      original,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if sales tax type is Including taxrate is not 0, totalAmount/(1+(taxRate/100)), if Excluding then totalAmount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatableAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatableAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatableAmountModifObj() {
    const original = this.getDataValue('vatableAmount');
    return {
      original,
    };
  }

  @ApiProperty({
    example: '1',
    description: 'if sales tax type is Tax Exempt, totalAmount else 0',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatExemptAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatExemptAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatExemptAmountModifObj() {
    const original = this.getDataValue('vatExemptAmount');
    return {
      original,
    };
  }

  @ApiProperty({
    example: '1',
    description: 'if taxCodeId is Zero-rated 0% then (total) else 0',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set zeroRatedAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('zeroRatedAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get zeroRatedAmountModifObj() {
    const original = this.getDataValue('zeroRatedAmount');
    return {
      original,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if sales tax type is Including/Excluding and taxrate is not 0, vatableAmount*(taxRate/100)',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatAmountModifObj() {
    const original = this.getDataValue('vatAmount');
    return {
      original,
    };
  }

  @ApiProperty({ example: '1', description: 'if selected taxcode is No Tax' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set notaxAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('notaxAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get notaxAmountModifObj() {
    const original = this.getDataValue('notaxAmount');
    return {
      original,
    };
  }

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if the line item is non cost account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isNonCost: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if the line item is other revenue account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isOtherExpenditure: boolean;

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

  // @ApiProperty({ example: '1', description: 'If taxCodeId is Exempt Sales/Disbursements then (total) else 0' })
  // @Column({ type: DataType.FLOAT, allowNull: true })
  // vatExAmount: number;

  @BelongsTo(() => CashDisbursementHeaderModel, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  cashDisbursementHeaderModel: CashDisbursementHeaderModel;
}
