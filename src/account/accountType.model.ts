import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { Group } from "../group/group.model";
import { ApiProperty } from "@nestjs/swagger";
import { Clashflow } from "../clashflow/clashflow.model";
import { Transaction } from 'src/transaction/transaction.model';
import { BankAccount } from 'src/bank-account/bank-account.model';
import { CreditCardAccount } from 'src/credit-card-account/credit-card-account.model';


@Table({ tableName: 'accountTypes', createdAt: false, updatedAt: false})
export class AccountType extends Model<AccountType>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.INTEGER, allowNull: false})
  accountTypeID: number;

  @Column({type: DataType.STRING, allowNull: false})
  accountTypeName: string;

}
