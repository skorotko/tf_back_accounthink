import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { UserAccount } from 'src/account/user-account.model';

interface RequestsQueueCreateAttrs {
  userAccountId: number;
  requestsQueueTypeId?: number;
  requestDate: Date;
  approveDate?: Date;
  rejectDate?: Date;
  issueDate?: Date;
  purpose: string;
  purposeReject?: string;
  requestByUserId: number;
  amount: number;
  urgent: boolean;
}

export enum RequestStatus {
  PENDING = 1, // Ожидает рассмотрения
  APPROVED = 2, // Утверждён
  ISSUED = 3, // Выполнен (выдан)
  REJECTED = 4, // Отклонён
}

export const RequestStatusText = {
  [RequestStatus.PENDING]: 'Pending',
  [RequestStatus.APPROVED]: 'Approved',
  [RequestStatus.ISSUED]: 'Issued',
  [RequestStatus.REJECTED]: 'Rejected',
};

export const RequestStatusColor = {
  [RequestStatus.PENDING]: '#FFFFFF',
  [RequestStatus.APPROVED]: '#55BBFF',
  [RequestStatus.ISSUED]: '#667D94',
  [RequestStatus.REJECTED]: '#C8102E',
};

function formatDate(inputDate) {
  const date = new Date(inputDate);

  // Получаем компоненты даты
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Определяем AM/PM и корректируем часы
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 часов становится 12 AM

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

@Table({ tableName: 'requests-queues', createdAt: false, updatedAt: false })
export class RequestsQueue extends Model<
  RequestsQueue,
  RequestsQueueCreateAttrs
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

  @ApiProperty({
    example: '2025-01-02T00:00:00Z',
    description: 'Reject date',
  })
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

  @ApiProperty({ example: '2025-01-03T00:00:00Z', description: 'Issue date' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('issueDate');
      if (!rawValue) return null;

      return formatDate(rawValue);
    },
  })
  issueDate: Date;

  @ApiProperty({
    example: 'Payment for services',
    description: 'Purpose of the request',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  purpose: string;

  @ApiProperty({
    example: 'Payment for services',
    description: 'Purpose of the reject',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  purposeReject: string;

  @ApiProperty({ example: 456, description: 'User who made the request' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  requestByUserId: number;

  @ApiProperty({ example: 1000.5, description: 'Request amount' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  amount: number;

  @ApiProperty({ example: true, description: 'Is request urgent?' })
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  urgent: boolean;

  @ApiProperty({ example: 1, description: 'Status ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: RequestStatus.PENDING,
  })
  statusId: number;

  @Column(DataType.VIRTUAL)
  get statusText(): string {
    return RequestStatusText[this.statusId] || 'Unknown';
  }

  @Column(DataType.VIRTUAL)
  get statusColor(): string {
    return RequestStatusColor[this.statusId] || 'Unknown';
  }

  // Ассоциации
  @BelongsTo(() => UserAccount, 'userAccountId')
  userAccount: UserAccount;
}