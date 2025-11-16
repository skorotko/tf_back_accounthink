import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Types } from "../types/types.model";
import { Clashflow } from "../clashflow/clashflow.model";
import { ApiProperty } from "@nestjs/swagger";
import { Group } from "../group/group.model";

interface ClassesCreateAttrs {
  code: string;
  name: string;
  typeId: number;
  companyId: number;
  filePath: string;
  createdBy: number | null;
  createdDate: number | null;
  DRCRCode: string;
  number: any;
  contra: number;
  defaultId: number;
}

@Table({tableName: 'classes', createdAt: false, updatedAt: false})
export class Classes extends Model<Classes, ClassesCreateAttrs>{

  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: '1', description: 'Default id'})
  @Column({type: DataType.INTEGER, allowNull: true})
  defaultId: number;

  @ApiProperty({example: false})
  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  indelible: boolean;

  @ApiProperty({example: 'class', description: 'Entity type name'})
  @Column({type: DataType.STRING, allowNull: false, defaultValue: 'class'})
  entityType: string;

  @ApiProperty({example: '1', description: 'Unique company identification number'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({example: '1', description: 'Identification type'})
  @ForeignKey(() => Types)
  @Column({type: DataType.INTEGER})
  typeId: number;

  @ApiProperty({example: true, description: 'true/false'})
  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: true})
  active: boolean;

  @ApiProperty({example: '1.1.1', description: 'Unique code'})
  @Column({type: DataType.STRING, allowNull: false})
  code: string;

  @ApiProperty({example: 'Class Name', description: 'Account name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @ApiProperty({example: '1.1', description: 'Custom number'})
  @Column({type: DataType.STRING, allowNull: true})
  number: string;

  @ApiProperty({example: '1 or 0'})
  @Column({type: DataType.INTEGER, allowNull: false})
  contra: number;

  @ApiProperty({example: 'DR', description: 'Has one of two meanings "DR" or "CR"'})
  @Column({type: DataType.ENUM({values: ['DR', 'CR']}), allowNull: false})
  DRCRCode: string;

  @ApiProperty({ example: '1', description: 'Identification clashflow' })
  @ForeignKey(() => Clashflow)
  @Column({ type: DataType.INTEGER, allowNull: true })
  clashflowId: number;

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

  @BelongsTo(() => Types)
  type: Types;

  @HasMany(()=> Group)
  groups: Group[];
  clashflowObj: Clashflow;
}
