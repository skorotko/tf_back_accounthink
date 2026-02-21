import {
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CashReceiptPaymentsModel } from 'src/cash-receipt/cash-receipt-payments/cash-receipt-payments.model';
import { CashReceiptDetailsModel } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.model';
import { Transaction } from 'src/transaction/transaction.model';
import { CashReceiptOverPaymentsModel } from '../cash-receipt-overPayments/cash-receipt-overPayments.model';

interface CashReceiptHeaderModelCreateAttrs {
  crDate: Date;
  clientId: number;
  clientTin: string;
  clientCurrency: string;
  fxRate: number;
  whtaxRate: number;
  vatWhtaxRate: number;
  isWHTax: boolean;
  isVatWHTax: boolean;
  isSinglePayment: boolean;
  isSplitPayment: boolean;
  isClearingAccount: boolean;
  isPDC: boolean;
  receivedBy: number;
  forUser: number;
  isSDtoSRA: boolean;
  isSSI: boolean;
  isBoth: boolean;
  amountsAre: number;
  sellingNotes: string;
  paymentFor: string;
  otherRevenueCharges: number;
  vatableAmount: number;
  vatExAmount: number;
  zeroRatedAmount: number;
  addVat: number;
  totalAmount: number;
  amountVatExclusive: number;
  addVatAmount: number;
  totalAmountVatInclusive: number;
  lessVatWHTax: number;
  lessWHTax: number;
  amountOwing: number;
  amountReceived: number;
  balanceOwing: number;
  amountOwingClientCurrency: number;
  balanceOwingClientCurrency: number;
  templateName: string;
  orNumber: string;
  issueDate: Date;
  isEOR: boolean;
  isEN: boolean;
  isEL: boolean;
  clientContact: string;
  clientEmail: string;
  createdBy: number;
  companyId: number;
  status: string;
  statused: string;
  clientUnderPayment: number;
  clientOverPayment: number;
  paymentCurrency: string;
  isSales: boolean;
  isDeposit: boolean;
  isAdvancesFrom: boolean;
  appliedUnderOverPMTBal: number;
  nonRevenueCharges: number;
  appliedDepositBal: number;
  appliedCashAdvanceBal: number;
  discount: number;
  isWHTaxToggle: boolean;
  isVatWHTaxToggle: boolean;
  isUseBalanceToggle: boolean;
  typeOfBusiness: string;
  paymentTerms: string;
  serviceVATCode: string;
  productVATCode: string;
}

@Table({ tableName: 'cashReceiptHeader' })
export class CashReceiptHeaderModel extends Model<
  CashReceiptHeaderModel,
  CashReceiptHeaderModelCreateAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ApiProperty({ example: '08.08.2021', description: 'cash receipt date' })
  @Column({ type: DataType.DATE, allowNull: true })
  crDate: Date;

  @ApiProperty({
    example: '1',
    description: 'selected client id number from the list of clients',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  clientId: number;

  @ApiProperty({ example: 'Inventory', description: 'client tin' })
  @Column({ type: DataType.STRING, allowNull: true })
  clientTin: string;

  @ApiProperty({
    example: 'PHP',
    description: 'selected client current currency',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  clientCurrency: string;

  @ApiProperty({ example: 'GJ0001', description: 'trasaction nunber' })
  @Column({ type: DataType.STRING, allowNull: true })
  transactionNo: string;

  @ApiProperty({
    example: 'PHP',
    description: 'selected current currency company or client',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentCurrency: string;

  @ApiProperty({
    example: '1',
    description: 'client foreign exchange rate from companys home currency',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  fxRate: number;

  @ApiProperty({ example: '1', description: 'client whtaxRate' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get whtaxRate(): number {
    return this.getDataValue('whtaxRate');
  }
  set whtaxRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('whtaxRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get whtaxRateModifObj() {
    const original = this.getDataValue('whtaxRate');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'client vatWhtaxRate' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get vatWhtaxRate(): number {
    return this.getDataValue('vatWhtaxRate');
  }
  set vatWhtaxRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('vatWhtaxRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get vatWhtaxRateModifObj() {
    const original = this.getDataValue('vatWhtaxRate');
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
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying withholding tax',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isWHTax: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying vat withholding tax',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isVatWHTax: boolean;

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
    example: 'true',
    description: 'tagging if cash receipt is sales transaction',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSales: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if cash receipt is deposit/downpayment transaction',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isDeposit: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging if cash receipt is advances or others',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isAdvancesFrom: boolean;

  @ApiProperty({
    example: '1',
    description: 'applied under or over payment balance',
  })
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
      'sum of vatableAmount, vatExAmount, zeroRatedAmount and notaxAmount in cashReceiptDetail table if the isNonRevenue column is TRUE',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get nonRevenueCharges(): number {
    return this.getDataValue('nonRevenueCharges');
  }
  set nonRevenueCharges(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('nonRevenueCharges', Number(value.toFixed(8)));
  }

  @ApiProperty({ example: '1', description: 'applied deposit balance amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get appliedDepositBal(): number {
    return this.getDataValue('appliedDepositBal');
  }
  set appliedDepositBal(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('appliedDepositBal', Number(value.toFixed(8)));
  }

  @ApiProperty({
    example: '1',
    description: 'applied cash advances balance amount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get appliedCashAdvanceBal(): number {
    return this.getDataValue('appliedCashAdvanceBal');
  }
  set appliedCashAdvanceBal(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('appliedCashAdvanceBal', Number(value.toFixed(8)));
  }

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

  @ApiProperty({
    example: '1',
    description:
      'selected user id from the list of authorized users to received cash',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  receivedBy: number;

  @ApiProperty({
    example: '1',
    description: 'selected user id from the list of users',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  forUser: number;

  @ApiProperty({
    example: 'true',
    description:
      'tagging for applying type of sales direct to service revenue account',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSDtoSRA: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for applying type of sales of service items',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSSI: boolean;

  @ApiProperty({
    example: 'true',
    description:
      'tagging for applying both type of sales direct to service revenue account and service items',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBoth: boolean;

  @ApiProperty({ example: '1', description: 'selected type of sales tax' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  amountsAre: number;

  @ApiProperty({ example: 'Inventory', description: 'selling notes' })
  @Column({ type: DataType.STRING, allowNull: true })
  sellingNotes: string;

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

  @ApiProperty({ example: 'Inventory', description: 'payment for' })
  @Column({ type: DataType.STRING, allowNull: true })
  paymentFor: string;

  @ApiProperty({
    example: '1',
    description:
      'sum of totalAmount in cashReceiptDetail table if the isOtherRevenue column is TRUE',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get otherRevenueCharges(): number {
    return this.getDataValue('otherRevenueCharges');
  }
  set otherRevenueCharges(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('otherRevenueCharges', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get otherRevenueChargesModifObj() {
    const original = this.getDataValue('otherRevenueCharges');
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
  get vatableAmount(): number {
    return this.getDataValue('vatableAmount');
  }
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
  get vatExAmount(): number {
    return this.getDataValue('vatExAmount');
  }
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
  get zeroRatedAmount(): number {
    return this.getDataValue('zeroRatedAmount');
  }
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
  get addVat(): number {
    return this.getDataValue('addVat');
  }
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
  get totalAmount(): number {
    return this.getDataValue('totalAmount');
  }
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
      'if amountsAre is No Tax then sum of totalAmount in cashReceiptDetail else (totalAmount - addVat)',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amountVatExclusive(): number {
    return this.getDataValue('amountVatExclusive');
  }
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
  get addVatAmount(): number {
    return this.getDataValue('addVatAmount');
  }
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
  get totalAmountVatInclusive(): number {
    return this.getDataValue('totalAmountVatInclusive');
  }
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
    description: 'computed vat withholding tax amount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lessVatWHTax(): number {
    return this.getDataValue('lessVatWHTax');
  }
  set lessVatWHTax(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessVatWHTax', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lessVatWHTaxModifObj() {
    const original = this.getDataValue('lessVatWHTax');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed withholding tax amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lessWHTax(): number {
    return this.getDataValue('lessWHTax');
  }
  set lessWHTax(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessWHTax', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lessWHTaxModifObj() {
    const original = this.getDataValue('lessWHTax');
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
  get amountOwing(): number {
    return this.getDataValue('amountOwing');
  }
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

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amountReceived(): number {
    return this.getDataValue('amountReceived');
  }
  set amountReceived(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountReceived', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountReceivedModifObj() {
    const original = this.getDataValue('amountReceived');
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
  get balanceOwing(): number {
    return this.getDataValue('balanceOwing');
  }
  set balanceOwing(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    // console.log('check');
    // console.log(Number((value).toFixed(8)));
    // console.log(value);
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

  @ApiProperty({ example: '1', description: 'computed owing balance' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  balanceOwingFractionPart: number;

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amountOwingClientCurrency(): number {
    return this.getDataValue('amountOwingClientCurrency');
  }
  set amountOwingClientCurrency(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountOwingClientCurrency', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountOwingClientCurrencyModifObj() {
    const original = this.getDataValue('amountOwingClientCurrency');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  //amountOwingClientCurrency: number;

  @ApiProperty({ example: '1', description: 'computed owing amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get balanceOwingClientCurrency(): number {
    return this.getDataValue('balanceOwingClientCurrency');
  }
  set balanceOwingClientCurrency(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('balanceOwingClientCurrency', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get balanceOwingClientCurrencyModifObj() {
    const original = this.getDataValue('balanceOwingClientCurrency');
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
  orNumber: string;

  @ApiProperty({ example: '08.08.2021', description: 'issue date' })
  @Column({ type: DataType.DATE, allowNull: true })
  issueDate: Date;

  @ApiProperty({
    example: 'true',
    description: 'tagging for receipt advice email official receipt (OR)',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isEOR: boolean;

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
    example: 'true',
    description: 'tagging for receipt delivery to dont send email to client',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isDSEC: boolean;

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

  @ApiProperty({
    example: '1',
    description: 'selected client contact id number from the list of clients',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  clientContactId: number;

  @ApiProperty({ example: 'Inventory', description: 'selected client contact' })
  @Column({ type: DataType.STRING, allowNull: true })
  clientContact: string;

  @ApiProperty({
    example: 'Inventory',
    description: 'selected client email address',
  })
  @Column({ type: DataType.STRING, allowNull: true })
  clientEmail: string;

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
    example: 'true',
    description: 'tagging for applying type of sales billable only',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBillable: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for allowing line discounts',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isLine: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for allowing lump sum discounts',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isLumpSum: boolean;

  @ApiProperty({
    example: 'true',
    description: 'tagging for allowing SC/PWD discounts',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isSCPWD: boolean;

  @ApiProperty({
    example: '1',
    description:
      'selection for lump sum discount either Blank, Percentage or Amount',
  })
  @Column({ type: DataType.INTEGER, allowNull: true })
  lumpsumDiscountId: number;

  @ApiProperty({
    example: '1',
    description: 'computed line selected lumpsum discount rate',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lumpsumDiscountRate(): number {
    return this.getDataValue('lumpsumDiscountRate');
  }
  set lumpsumDiscountRate(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lumpsumDiscountRate', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lumpsumDiscountRateModifObj() {
    const original = this.getDataValue('lumpsumDiscountRate');
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
    description: 'inputted lumpsum discount amount',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lumpsumDiscAmount(): number {
    return this.getDataValue('lumpsumDiscAmount');
  }
  set lumpsumDiscAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lumpsumDiscAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lumpsumDiscAmountModifObj() {
    const original = this.getDataValue('lumpsumDiscAmount');
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
      'if lumpsumDiscountRate have rate, (sum totalAmount column in cashReceiptDetail table*lumpsumDiscountRate column in cashReceiptHeader table), else lumpsumDiscountAmount in cashReceiptHeader table',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lumpsumDiscountAmount(): number {
    return this.getDataValue('lumpsumDiscountAmount');
  }
  set lumpsumDiscountAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lumpsumDiscountAmount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lumpsumDiscountAmountModifObj() {
    const original = this.getDataValue('lumpsumDiscountAmount');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed line discounts offered' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lineDiscountsOffered(): number {
    return this.getDataValue('lineDiscountsOffered');
  }
  set lineDiscountsOffered(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lineDiscountsOffered', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lineDiscountsOfferedModifObj() {
    const original = this.getDataValue('lineDiscountsOffered');
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
    description: 'computed lump sum discounts offered',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lumpsumDiscountsOffered(): number {
    return this.getDataValue('lumpsumDiscountsOffered');
  }
  set lumpsumDiscountsOffered(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lumpsumDiscountsOffered', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lumpsumDiscountsOfferedModifObj() {
    const original = this.getDataValue('lumpsumDiscountsOffered');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @ApiProperty({ example: '1', description: 'computed SC/PWD discount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lessSCPWDDiscount(): number {
    return this.getDataValue('lessSCPWDDiscount');
  }
  set lessSCPWDDiscount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessSCPWDDiscount', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get lessSCPWDDiscountModifObj() {
    const original = this.getDataValue('lessSCPWDDiscount');
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
      'sum of (lineDiscountsOffered+lumpsumDiscountsOffered+lessSCPWDDiscount)',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get lessTotalDiscounts(): number {
    return this.getDataValue('lessTotalDiscounts');
  }
  set lessTotalDiscounts(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('lessTotalDiscounts', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get ModifObj() {
    const original = this.getDataValue('lessTotalDiscounts');
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
    description: 'amountVatExclusive - lessTotalDiscounts',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get amountNetDiscounts(): number {
    return this.getDataValue('amountNetDiscounts');
  }
  set amountNetDiscounts(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    this.setDataValue('amountNetDiscounts', Number(value.toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get amountNetDiscountsModifObj() {
    const original = this.getDataValue('amountNetDiscounts');
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
      'if total amountReceived is less than amountOwing then balanceOwing',
  })
  @Column({ type: DataType.FLOAT, allowNull: true })
  get clientUnderPayment(): number {
    return this.getDataValue('clientUnderPayment');
  }
  set clientUnderPayment(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    if (value > 0) {
      this.setDataValue('clientUnderPayment', Number(value.toFixed(8)));
    } else {
      this.setDataValue('clientUnderPayment', 0);
    }
  }

  @Column(DataType.VIRTUAL)
  get clientUnderPaymentModifObj() {
    const original = this.getDataValue('clientUnderPayment');
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
  get clientOverPayment(): number {
    return this.getDataValue('clientOverPayment');
  }
  set clientOverPayment(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value)) value = 0;
    if (value < 0) {
      this.setDataValue('clientOverPayment', Number(value.toFixed(8)) * -1);
    } else {
      this.setDataValue('clientOverPayment', 0);
    }
  }

  @Column(DataType.VIRTUAL)
  get clientOverPaymentModifObj() {
    const original = this.getDataValue('clientOverPayment');
    const afterRate = Number(
      (original * this.getDataValue('fxRate')).toFixed(8),
    );
    return {
      original,
      afterRate,
    };
  }

  @BeforeUpdate
  static async checkBeforeUpdate(instance: CashReceiptHeaderModel) {
    console.log(instance);
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: CashReceiptHeaderModel) {
    if (instance.isBlock) {
      return false;
    }
  }

  // @ApiProperty({ example: '1', description: 'encoded amount charges' })
  // @Column({ type: DataType.BIGINT, allowNull: true })
  // chargesApplied: number;

  // @ApiProperty({ example: '1', description: 'computed vat exclusive amount' })
  // @Column({ type: DataType.BIGINT, allowNull: true })
  // amountVatExcluded: number;

  // @ApiProperty({ example: '1', description: 'computed vat inclusive amount' })
  // @Column({ type: DataType.BIGINT, allowNull: true })
  // totalAmountVatInclusinve: number;

  // @ApiProperty({ example: '1', description: 'computed net of vat amount' })
  // @Column({ type: DataType.BIGINT, allowNull: true })
  // amountNetVat: number;

  @HasMany(() => CashReceiptPaymentsModel)
  cashReceiptPayments: CashReceiptPaymentsModel[];

  @HasMany(() => CashReceiptDetailsModel)
  cashReceiptDetails: CashReceiptDetailsModel[];

  @HasMany(() => CashReceiptOverPaymentsModel)
  cashReceiptOverPayments: CashReceiptOverPaymentsModel[];

  // @HasOne(() => Transaction)
  // transaction: Transaction;

  @BelongsTo(() => Transaction)
  transaction: Transaction;
}
