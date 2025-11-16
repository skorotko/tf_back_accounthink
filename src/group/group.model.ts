import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Classes } from "../classes/classes.model";
import { Clashflow } from "../clashflow/clashflow.model";
import { ApiProperty } from "@nestjs/swagger";
import { Account } from "../account/account.model";

interface GroupCreateAttrs {
  code: string;
  name: string;
  companyId: number;
  classId: number;
  clashflowId: number;
  filePath: string;
  createdBy: number;
  createdDate: number;
  DRCRCode: string;
  number: any;
  contra: boolean;
  active: boolean;
  defaultId: number | null;
}

@Table({tableName: 'groups', createdAt: false, updatedAt: false})
export class Group extends Model<Group, GroupCreateAttrs>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: '1', description: 'Default class id'})
  @Column({type: DataType.INTEGER, allowNull: true})
  defaultClassId: number;

  @ApiProperty({example: '1', description: 'Default id'})
  @Column({type: DataType.INTEGER, allowNull: true})
  defaultId: number;

  @ApiProperty({example: false})
  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  indelible: boolean;

  @ApiProperty({example: 'group', description: 'Entity type name'})
  @Column({type: DataType.STRING, allowNull: false, defaultValue: 'group'})
  entityType: string;

  @ApiProperty({ example: 'GENERAL', description: 'Transaction code name' })
  @Column({ type: DataType.STRING, allowNull: true, defaultValue: 'GENERAL' })
  transactionCode: string;

  @ApiProperty({example: '1', description: 'Unique company identification number'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({example: '1', description: 'Identification class'})
  @ForeignKey(() => Classes)
  @Column({type: DataType.INTEGER})
  classId: number;

  @ApiProperty({example: '1', description: 'Identification clashflow'})
  @ForeignKey(() => Clashflow)
  @Column({type: DataType.INTEGER})
  clashflowId: number;

  @ApiProperty({example: 'false'})
  @Column({type: DataType.BOOLEAN, allowNull: false})
  contra: boolean;

  @ApiProperty({example: 'true', description: 'Group active status'})
  @Column({type: DataType.BOOLEAN, defaultValue: true, allowNull: false})
  active: boolean;

  @ApiProperty({example: '1.1.1', description: 'Unique code'})
  @Column({type: DataType.STRING, allowNull: false})
  code: string;

  @ApiProperty({example: 'Inventory', description: 'Group name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @ApiProperty({example: '1.1', description: 'Custom number'})
  @Column({type: DataType.STRING, allowNull: true})
  number: string;

  @ApiProperty({example: 'DR', description: 'Has one of two meanings "DR" or "CR"'})
  @Column({type: DataType.ENUM({values: ['DR', 'CR']}), allowNull: false})
  DRCRCode: string;

  @ApiProperty({example: 'admin', description: 'Who created'})
  @Column({type: DataType.STRING, allowNull: true})
  createdBy: number;

  @ApiProperty({example: 'admin', description: 'Who made the update'})
  @Column({type: DataType.STRING, allowNull: true})
  updatedBy: number;

  @ApiProperty({example: '08.08.2021', description: 'Date of creation'})
  @Column({type: DataType.DATE, allowNull: true})
  createdDate: number;

  @ApiProperty({example: '08.08.2021', description: 'Update date'})
  @Column({type: DataType.DATE, allowNull: true})
  updatedDate: number;

  @Column({type: DataType.STRING, allowNull: false})
  filePath: string;

  @BelongsTo(() => Classes)
  class: Classes;

  @BelongsTo(() => Clashflow)
  clashflow: Clashflow;

  @HasMany(()=> Account)
  accounts: Account[];

  @ApiProperty({example: 'this IT', description: 'remark'})
  @Column({type: DataType.STRING, allowNull: true})
  remarks: string;
  clashflowObj: Clashflow;
}
