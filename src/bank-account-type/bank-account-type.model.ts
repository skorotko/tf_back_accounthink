import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { BankAccount } from 'src/bank-account/bank-account.model';

interface BankAccountTypeCreateAttrs {
  name: string;
  code: string;
  companyId: number;
}

@Table({ tableName: 'bankAccountTypes', createdAt: false, updatedAt: false})
export class BankAccountType extends Model<BankAccountType, BankAccountTypeCreateAttrs>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  code: string;

  @HasOne(() => BankAccount)
  bankAccount: BankAccount;

}
