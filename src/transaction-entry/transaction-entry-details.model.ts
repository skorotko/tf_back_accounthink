import {
  BeforeDestroy,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Transaction } from '../transaction/transaction.model';
import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/account.model';

interface TransactionEntryDetailsCreateAttrs {
  transactionEntryId: number;
  accountId: number;
  DRCRCode: string;
  debit: number;
  credit: number;
  amount: number;
  companyId: number;
  userId: number;
  createdBy: number;
  createdDate: number;
}

@Table({
  tableName: 'transactionEntryDetails',
  createdAt: false,
  updatedAt: false,
})
export class TransactionEntryDetails extends Model<
  TransactionEntryDetails,
  TransactionEntryDetailsCreateAttrs
> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '1',
    description:
      'Transaction identification number that links to transaction table on the above table',
  })
  @ForeignKey(() => Transaction)
  @Column({ type: DataType.INTEGER, allowNull: false })
  transactionEntryId: number;

  @ApiProperty({
    example: '1',
    description:
      'Assigned Account identification number pertaining to account, refer the account table above',
  })
  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: false })
  accountId: number;

  @ApiProperty({
    example: 'DRCRCode',
    description: 'DRCRCode of the account, refer to the account table above',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  DRCRCode: string;

  @ApiProperty({
    example: '1',
    description: 'Assigned credit of the te details',
  })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  debit: number;

  @ApiProperty({ example: '1', description: 'Assigned credit of the te debit' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  credit: number;

  @ApiProperty({ example: '1', description: 'Assigned amount of the account' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  amount: number;

  @ApiProperty({ example: '1', description: 'Company identification' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  companyId: number;

  @ApiProperty({
    example: 'true',
    description: 'blocked before date block',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  isBlock: boolean;

  @ApiProperty({
    example: '1',
    description: 'User id who created the opening balance of an account',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  createdBy: number;

  @ApiProperty({
    example: '08.08.2021',
    description: 'Current date and time of the server',
  })
  @BeforeUpdate
  static async checkBeforeUpdate(instance: TransactionEntryDetails) {
    if (instance.isBlock) {
      return false;
    }
  }

  @BeforeDestroy
  static async checkBeforeDestroy(instance: TransactionEntryDetails) {
    if (instance.isBlock) {
      return false;
    }
  }

  @Column({ type: DataType.DATE, allowNull: false })
  createdDate: number;

  @BelongsTo(() => Transaction)
  transaction: Transaction;

  @BelongsTo(() => Account)
  account: Account;
}
