import {Column, DataType, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {Account} from "../account/account.model";

interface PaymentMethodCreateAttrs {
  companyId: number;
  name: string;
  code: string;
  multiAccount: boolean;
  accountId: Array<number>
}

@Table({tableName: 'paymentMethod', createdAt: true, updatedAt: true})
export class PaymentMethod extends Model<PaymentMethod, PaymentMethodCreateAttrs>{
  @ApiProperty({example: 1, description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 1, description: 'Company id'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({example: 'Payment method Name', description: 'Payment method Name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @ApiProperty({description: 'Unique code'})
  @Column({type: DataType.STRING, allowNull: false})
  code: string;

  @ApiProperty({description: ''})
  @Column({type: DataType.BOOLEAN, allowNull: false})
  multiAccount: boolean;

  @ApiProperty({description: ''})
  @Column({type: DataType.ARRAY(DataType.INTEGER), allowNull: false})
  accountId: Array<number>

  accounts?: Array<Account>
}