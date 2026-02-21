import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";


@Table({ tableName: 'AccountingMethodMapping', createdAt: false, updatedAt: false})
export class AccountingMethodMapping extends Model<AccountingMethodMapping>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, field: 'Id'})
  id: number;

  @Column({type: DataType.STRING, allowNull: false,  field: 'DBCode'})
  dBCode: string;

  @Column({type: DataType.INTEGER, allowNull: false, field: 'MethodOfAccountingId'})
  methodOfAccountingId: number;

  @Column({type: DataType.INTEGER, allowNull: false, field: 'BusinessTypeId'})
  businessTypeId: number;

  @Column({type: DataType.INTEGER, allowNull: false, field: 'BusinessFormationId'})
  businessFormationId: number;

  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'ShowHide'})
  showHide: number;

}