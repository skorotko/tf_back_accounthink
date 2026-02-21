import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, HasOne, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Transaction } from 'src/transaction/transaction.model';
import { CashDisbursementDetailsModel } from '../cash-disbursement-details/cash-disbursement-details.model';
import { CashDisbursementPaymentsModel } from '../cash-disbursement-payments/cash-disbursement-payments.model';
import { CashDisbursementOverPaymentsModel } from '../cash-disbursement-overPayments/cash-disbursement-overPayments.model';

interface CashDisbursementHeaderModelCreateAttrs {
  cdDate: Date,
  vendorId: number,
  vendorTin: string,
  vendorCurrency: string,
  paymentCurrency: string,
  fxRate: number,
  whtaxExpandedRate: number,
  vatWhtaxExpandedRate: number,
  isWHTaxExpanded: boolean,
  isVatWHTaxExapnded: boolean,
  isSinglePayment: boolean,
  isSplitPayment: boolean,
  isClearingAccount: boolean,
  isPDC: boolean,
  paidBy: number,
  forUser: number,
  isCostService: boolean,
  isExpense: boolean,
  isBuyingItems: boolean,
  isBoth: boolean,
  isChangeDirectToCostBoth: boolean,
  amountsAre: number,
  purchasingNotes: string,
  otherExpendituresCharges: number,
  vatableAmount: number,
  vatExAmount: number,
  zeroRatedAmount: number,
  addVat: number,
  totalAmount: number,
  amountVatExclusive: number,
  addVatAmount: number,
  totalAmountVatInclusive: number,
  lessVatWHTaxExpanded: number,
  lessWHTaxExpanded: number,
  amountOwing: number,
  amountPaid: number,
  balanceOwing: number,
  amountOwingVendorCurrency: number,
  balanceOwingVendorCurrency: number,
  templateName: string,
  cvNumber: string,
  issueDate: Date,
  isECV: boolean,
  isEN: boolean,
  isEL: boolean,
  vendorContact: string,
  vendorEmail: string,
  createdBy: number,
  companyId: number,
  status: string,
  statused: string,
  vendorUnderPayment: number,
  vendorOverPayment: number,
  paymentFor: string,
  discount: number,
  isCostExpenses: boolean,
  isPurchaseAsset: boolean,
  isPrepaymentsDeposits: boolean,
  isOthers: boolean,
  nonCostCharges: number,
  appliedUnderOverPMTBal: number,
  isWHTaxToggle: boolean,
  isVatWHTaxToggle: boolean,
  isUseBalanceToggle: boolean
}

@Table({ tableName: 'cashDisbursementHeader' })
export class CashDisbursementHeaderModel extends Model<
  CashDisbursementHeaderModel,
  CashDisbursementHeaderModelCreateAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({ example: '08.08.2021', description: 'cash disbursement date' })
  @Column({ type: DataType.DATE, allowNull: true })
  cdDate: Date;

  @ApiProperty({
    example: '1',
    description: 'selected vendor id number from the list of vendors',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  vendorId: number;

  @ApiProperty({ example: 'Inventory', description: 'vendor tin' })
  @Column({ type: DataType.STRING, allowNull: true })
  vendorTin: string;

  @ApiProperty({
    example: 'PHP',
    description: 'selected vendor current currency',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  vendorCurrency: string;

  @ApiProperty({ example: 'GJ0001', description: 'trasaction nunber' })
  @Column({ type: DataType.STRING, allowNull: true })
  transactionNo: string;

  @ApiProperty({
    example: 'PHP',
    description: 'selected vendor currency company or client',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentCurrency: string;

  @ApiProperty({
    example: '1',
    description: 'vendor foreign exchange rate from companys home currency',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  fxRate: number;

  @ApiProperty({ example: '1', description: 'vendor whtaxExpandedRate' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set whtaxExpandedRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('whtaxExpandedRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get whtaxExpandedRateModifObj() {
    const original = this.getDataValue('whtaxExpandedRate');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'vendor vatWhtaxExpandedRate' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatWhtaxExpandedRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatWhtaxExpandedRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatWhtaxExpandedRateModifObj() {
    const original = this.getDataValue('vatWhtaxExpandedRate');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying withholding tax expanded',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isWHTaxExpanded: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying vat withholding tax expanded',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isVatWHTaxExapnded: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying vat withholding tax toggle',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isWHTaxToggle: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying vat withholding tax toggle',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isVatWHTaxToggle: boolean;

  @ApiProperty({ example: 'true', description: 'tagging use balance toggle' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isUseBalanceToggle: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for using single payment method',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSinglePayment: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for using split payment method',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSplitPayment: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for  using clearing account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isClearingAccount: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for using post dated cheques',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isPDC: boolean;

  @ApiProperty({
    example: '1',
    description:
      'selected user id from the list of authorized users who will pay the cash',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  paidBy: number;

  @ApiProperty({
    example: '1',
    description: 'selected user id from the list of users',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  forUser: number;

  @ApiProperty({
    example: 'true',
    description:
      'tagging for applying type of expenditure direct to cost of service account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isCostService: boolean;

  @ApiProperty({
    example: 'true',
    description:
      'tagging for applying type of expenditure direct to expense account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isExpense: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying type of expenditure buying of items',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBuyingItems: boolean;

  @ApiProperty({
    example: 'true',
    description:
      'tagging for applying both type of sales direct to service revenue account and service items',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBoth: boolean;

  @ApiProperty({ example: 'true', description: 'isChangeDirectToCostBoth' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isChangeDirectToCostBoth: boolean;

  @ApiProperty({ example: 'true', description: 'isCostExpenses' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isCostExpenses: boolean;

  @ApiProperty({ example: 'true', description: 'isPurchaseAsset' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isPurchaseAsset: boolean;

  @ApiProperty({ example: 'true', description: 'isPrepaymentsDeposits' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isPrepaymentsDeposits: boolean;

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({ example: 'Inventory', description: 'typeOfBusiness' })
  @Column({ type: DataType.STRING, allowNull: true })
  typeOfBusiness: string;

  @ApiProperty({ example: 'Inventory', description: 'paymentTerms' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentTerms: string;

  @ApiProperty({ example: 'Inventory', description: 'serviceVATCode' })
  @Column({ type: DataType.STRING, allowNull: true })
  serviceVATCode: string;

  @ApiProperty({ example: 'Inventory', description: 'productVATCode' })
  @Column({ type: DataType.STRING, allowNull: true })
  productVATCode: string;

  @ApiProperty({ example: 'true', description: 'isOthers' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isOthers: boolean;

  @ApiProperty({ example: '1', description: 'selected type of sales tax' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  amountsAre: number;

  @ApiProperty({ example: 'Inventory', description: 'purchasing notes' })
  @Column({ type: DataType.STRING, allowNull: true })
  purchasingNotes: string;

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

  @ApiProperty({ example: '1', description: 'nonCostCharges' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get nonCostCharges(): number {
    return this.getDataValue('nonCostCharges');
  }
  set nonCostCharges(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('nonCostCharges', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'appliedUnderOverPMTBal' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get appliedUnderOverPMTBal(): number {
    return this.getDataValue('appliedUnderOverPMTBal');
  }
  set appliedUnderOverPMTBal(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('appliedUnderOverPMTBal', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description:
      'sum of totalAmount in cashDisbursementDetail table if the isOtherExpenditure column is TRUE',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set otherExpendituresCharges(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('otherExpendituresCharges', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get otherExpendituresChargesModifObj() {
    const original = this.getDataValue('otherExpendituresCharges');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed vatable amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatableAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatableAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatableAmountModifObj() {
    const original = this.getDataValue('vatableAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed vatable exempt amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vatExAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatExAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatExAmountModifObj() {
    const original = this.getDataValue('vatExAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed zero rated amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set zeroRatedAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('zeroRatedAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get zeroRatedAmountModifObj() {
    const original = this.getDataValue('zeroRatedAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed vat amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set addVat(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('addVat', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get addVatModifObj() {
    const original = this.getDataValue('addVat');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed total amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set totalAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('totalAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get totalAmountModifObj() {
    const original = this.getDataValue('totalAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if amountsAre is No Tax then sum of totalAmount in cashDisbursementDetail else (totalAmount - addVat)',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amountVatExclusive(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountVatExclusive', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountVatExclusiveModifObj() {
    const original = this.getDataValue('amountVatExclusive');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'addVatAmount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set addVatAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('addVatAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get addVatAmountModifObj() {
    const original = this.getDataValue('addVatAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description: 'amountNetDiscounts + addVatAmount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set totalAmountVatInclusive(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('totalAmountVatInclusive', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get totalAmountVatInclusiveModifObj() {
    const original = this.getDataValue('totalAmountVatInclusive');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if isVatWhtaxExpanded=TRUE then (amountVatExclusive*(vatWhtaxExpandedRate/100)) else 0.00',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set lessVatWHTaxExpanded(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessVatWHTaxExpanded', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lessVatWHTaxExpandedModifObj() {
    const original = this.getDataValue('lessVatWHTaxExpanded');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if isWHTaxExpanded =TRUE then (amountVatExclusive*(whtaxRateExpanded/100)) else 0.00',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set lessWHTaxExpanded(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessWHTaxExpanded', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lessWHTaxExpandedModifObj() {
    const original = this.getDataValue('lessWHTaxExpanded');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amountOwing(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountOwing', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountOwingModifObj() {
    const original = this.getDataValue('amountOwing');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description: 'sum of amountReceived in cashDisbursementDetail table',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amountPaid(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountPaid', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountPaidModifObj() {
    const original = this.getDataValue('amountPaid');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed owing balance' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set balanceOwing(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('balanceOwing', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get balanceOwingModifObj() {
    const original = this.getDataValue('balanceOwing');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set amountOwingVendorCurrency(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountOwingVendorCurrency', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountOwingVendorCurrencyModifObj() {
    const original = this.getDataValue('amountOwingVendorCurrency');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set balanceOwingVendorCurrency(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('balanceOwingVendorCurrency', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get balanceOwingVendorCurrencyModifObj() {
    const original = this.getDataValue('balanceOwingVendorCurrency');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'selected template name' })
  @Column({ type: DataType.STRING, allowNull: true })
  templateName: string;

  @ApiProperty({ example: 'Inventory', description: 'automated OR number' })
  @Column({ type: DataType.STRING, allowNull: true })
  cvNumber: string;

  @ApiProperty({ example: '08.08.2021', description: 'issue date' })
  @Column({ type: DataType.DATE, allowNull: true })
  issueDate: Date;

  @ApiProperty({
    example: 'true',
    description: 'tagging for receipt advice email official receipt (OR)',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isECV: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for receipt advice email now',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isEN: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for receipt advice email later',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isEL: boolean;

  @ApiProperty({
    example: '1',
    description: 'selected vendor contact id number from the list of vendors',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  vendorContactId: number;

  @ApiProperty({ example: 'Inventory', description: 'selected vendor contact' })
  @Column({ type: DataType.STRING, allowNull: true })
  vendorContact: string;

  @ApiProperty({
    example: 'Inventory',
    description: 'selected vendor email address',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  vendorEmail: string;

  @ApiProperty({
    example: '1',
    description: 'latest status of the cash receipt',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  status: string;

  @ApiProperty({
    example: '1',
    description: 'latest status of the cash receipt',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  statused: string;

  @ApiProperty({ example: '1', description: 'transaction journal id number' })
  @ForeignKey(() => Transaction)
  @Column({ type: DataType.INTEGER, allowNull: true })
  tranId: number;

  @ApiProperty({ example: '1', description: 'transaction journal id number' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  saveTranId: number;

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

  @ApiProperty({
    example: '1',
    description:
      'if total amountReceived is less than amountOwing then balanceOwing',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vendorUnderPayment(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    if (value > 0) {
      this.setDataValue('vendorUnderPayment', Number(value.toFixed(8)));
    } else {
      this.setDataValue('vendorUnderPayment', 0);
    }
  }

  @Column(DataType.VIRTUAL)
  get vendorUnderPaymentModifObj() {
    const original = this.getDataValue('vendorUnderPayment');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({
    example: '1',
    description:
      'if total amountReceived is greater than amountOwing then balanceOwing',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set vendorOverPayment(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    if (value < 0) {
      this.setDataValue('vendorOverPayment', Number(value.toFixed(8)) * -1);
    } else {
      this.setDataValue('vendorOverPayment', 0);
    }
  }

  @Column(DataType.VIRTUAL)
  get vendorOverPaymentModifObj() {
    const original = this.getDataValue('vendorOverPayment');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'FractionPart' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  vendorOverPaymentFractionPart: number;

  @ApiProperty({
    example: 'true',
    description: 'tagging for receipt delivery to dont send email to vendor',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isDSEV: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if OR is a full payment',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isFullPayment: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if OR is a partial payment',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isPartialPayment: boolean;

  @ApiProperty({ example: 'Inventory', description: 'payment for' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentFor: string;

  @HasMany(() => CashDisbursementPaymentsModel)
  cashDisbursementPayments: CashDisbursementPaymentsModel[];

  @HasMany(() => CashDisbursementDetailsModel)
  cashDisbursementDetails: CashDisbursementDetailsModel[];

  @HasMany(() => CashDisbursementOverPaymentsModel)
  cashDisbursementOverPayments: CashDisbursementOverPaymentsModel[];

  // @HasOne(() => Transaction)
  // transaction: Transaction;

  @BelongsTo(() => Transaction)
  transaction: Transaction;
}
