import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UserAccount } from 'src/account/user-account.model';
import { Account } from 'src/account/account.model';

interface ExpendituresQueueCreateAttrs {
  userAccountId?: number;
  requestDate?: Date;
  requestByUserId?: number;
  isExpenditure?: boolean;
  mDataObj?: object;
  vendorName?: string;
  vendorTin?: string;
  vendorContactAddress?: string;
  vendorPhone?: string;
  transactionDate?: string;
  transactionArunumber?: string;
  transactionRcptnumber?: string;
  transactionItemsObj?: object;
  vatableAmount?: number;
  totalAmount?: number;
  vatableAmountInclusive?: number;
  vatableAmountExclusive?: number;
  vatableAmountWithoutTax?: number;
  serviceCharge?: number;
  amountTendered?: number;
  paymentMethod?: string;
  chargeGiven?: number;
  currency?: string;
  tips?: number;
  expenseAccountId: number;
}

export enum ExpenditureStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  LIQUIDATED = 4,
}

export const ExpenditureStatusText = {
  [ExpenditureStatus.PENDING]: 'Pending',
  [ExpenditureStatus.APPROVED]: 'Approved',
  [ExpenditureStatus.REJECTED]: 'Rejected',
  [ExpenditureStatus.LIQUIDATED]: 'Liquidated',
};

export const ExpenditureStatusColor = {
  [ExpenditureStatus.PENDING]: '#FFFFFF',
  [ExpenditureStatus.APPROVED]: '#55BBFF',
  [ExpenditureStatus.REJECTED]: '#C8102E',
  [ExpenditureStatus.LIQUIDATED]: '#00AA00',
};

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

@Table({ tableName: 'expenditures-queues', createdAt: false, updatedAt: false })
export class ExpendituresQueue extends Model<
  ExpendituresQueue,
  ExpendituresQueueCreateAttrs
> {
  @ApiProperty({ example: 1, description: 'Unique ID' })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'id',
  })
  id: number;

  @ApiProperty({ example: 123, description: 'User account ID' })
  @ForeignKey(() => UserAccount)
  @Column({ type: DataType.INTEGER, allowNull: true })
  userAccountId: number;

  @ApiProperty({ example: 123, description: 'Expense account ID' })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  expenseAccountId: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Request date' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('requestDate');
      if (!rawValue) return null;
      return formatDate(rawValue);
    },
  })
  requestDate: Date;

  @ApiProperty({
    example: '2025-01-02T00:00:00Z',
    description: 'Approval date',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('approveDate');
      if (!rawValue) return null;
      return formatDate(rawValue);
    },
  })
  approveDate: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00Z', description: 'Reject date' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('rejectDate');
      if (!rawValue) return null;
      return formatDate(rawValue);
    },
  })
  rejectDate: Date;

  @ApiProperty({
    example: '2025-01-03T00:00:00Z',
    description: 'Liquidation date',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('liquidateDate');
      if (!rawValue) return null;
      return formatDate(rawValue);
    },
  })
  liquidateDate: Date;

  @ApiProperty({
    example: 'Incomplete documentation',
    description: 'Reject reason',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  purposeReject: string;

  @ApiProperty({ example: 456, description: 'User who made the request' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  requestByUserId: number;

  @ApiProperty({ example: true, description: 'Is expenditure?' })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  isExpenditure: boolean;

  @ApiProperty({ example: '{"key":"value"}', description: 'Metadata object' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('mDataObj');
      if (!rawValue) return null;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Failed to parse mDataObj:', e);
        return null;
      }
    },
    set(value: any) {
      if (value && typeof value === 'object') {
        this.setDataValue('mDataObj', JSON.stringify(value));
      } else if (value) {
        this.setDataValue('mDataObj', value);
      } else {
        this.setDataValue('mDataObj', null);
      }
    },
  })
  mDataObj: Record<string, any> | string | null;

  @ApiProperty({ example: 'Vendor Inc.', description: 'Vendor name' })
  @Column({ type: DataType.TEXT, allowNull: true })
  vendorName: string;

  @ApiProperty({ example: '123456789', description: 'Vendor TIN' })
  @Column({ type: DataType.TEXT, allowNull: true })
  vendorTin: string;

  @ApiProperty({ example: '123 Main St', description: 'Vendor address' })
  @Column({ type: DataType.TEXT, allowNull: true })
  vendorContactAddress: string;

  @ApiProperty({ example: '+1234567890', description: 'Vendor phone' })
  @Column({ type: DataType.TEXT, allowNull: true })
  vendorPhone: string;

  @ApiProperty({ example: '2025-01-01', description: 'Transaction date' })
  @Column({ type: DataType.TEXT, allowNull: true })
  transactionDate: string;

  @ApiProperty({ example: 'ARU12345', description: 'Transaction ARU number' })
  @Column({ type: DataType.TEXT, allowNull: true })
  transactionArunumber: string;

  @ApiProperty({
    example: 'RCPT67890',
    description: 'Transaction receipt number',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  transactionRcptnumber: string;

  @ApiProperty({
    example: '[{"item":"description"}]',
    description: 'Transaction items',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('transactionItemsObj');
      if (!rawValue) return null;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Failed to parse transactionItemsObj:', e);
        return null;
      }
    },
    set(value: any) {
      if (value && typeof value === 'object') {
        this.setDataValue('transactionItemsObj', JSON.stringify(value));
      } else if (value) {
        this.setDataValue('transactionItemsObj', value);
      } else {
        this.setDataValue('transactionItemsObj', null);
      }
    },
  })
  transactionItemsObj: any[] | string | null;

  @ApiProperty({ example: 100.0, description: 'Vatable amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  vatableAmount: number;

  @ApiProperty({ example: 100.0, description: 'Total amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  totalAmount: number;

  @ApiProperty({ example: 118.0, description: 'Vatable amount inclusive' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  vatableAmountInclusive: number;

  @ApiProperty({ example: 100.0, description: 'Vatable amount exclusive' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  vatableAmountExclusive: number;

  @ApiProperty({ example: 100.0, description: 'Vatable amount without tax' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  vatableAmountWithoutTax: number;

  @ApiProperty({ example: 10.0, description: 'Service charge' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  serviceCharge: number;

  @ApiProperty({ example: 120.0, description: 'Amount tendered' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  amountTendered: number;

  @ApiProperty({ example: 'Cash', description: 'Payment method' })
  @Column({ type: DataType.TEXT, allowNull: true })
  paymentMethod: string;

  @ApiProperty({ example: 20.0, description: 'Change given' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  chargeGiven: number;

  @ApiProperty({ example: 'USD', description: 'Currency' })
  @Column({ type: DataType.TEXT, allowNull: true })
  currency: string;

  @ApiProperty({ example: 5.0, description: 'Tips' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  tips: number;

  @ApiProperty({ example: 1, description: 'Status ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: ExpenditureStatus.PENDING,
  })
  statusId: number;

  @Column(DataType.VIRTUAL)
  get statusText(): string {
    return ExpenditureStatusText[this.statusId] || 'Unknown';
  }

  @Column(DataType.VIRTUAL)
  get statusColor(): string {
    return ExpenditureStatusColor[this.statusId] || 'Unknown';
  }

  @BelongsTo(() => UserAccount, 'userAccountId')
  userAccount: UserAccount;

  @BelongsTo(() => Account, 'expenseAccountId')
  expenseAccount: Account;
}
