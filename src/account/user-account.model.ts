import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Account } from './account.model';
import { ExpendituresQueue } from 'src/expenditures-queue/expenditures-queue.model';
import { RequestsQueue } from 'src/requests-queue/requests-queue.model';

interface UserAccountCreateAttrs {
  userId: number;
  accountId: number;
  companyId: number;
  cashAccountTypeId: number;
}

@Table({ tableName: 'user-accounts', createdAt: false, updatedAt: false })
export class UserAccount extends Model<UserAccount, UserAccountCreateAttrs> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  userId: number;

  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: false })
  accountId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  cashAccountTypeId: number;

  @BelongsTo(() => Account)
  account: Account[];

  @HasMany(() => ExpendituresQueue)
  expendituresQueue: ExpendituresQueue[];

  @HasMany(() => RequestsQueue)
  requestsQueue: RequestsQueue[];
}
