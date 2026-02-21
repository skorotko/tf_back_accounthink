import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Classes } from "../classes/classes.model";
import { TaxType } from "../tax-type/tax-type.model";

@Table({tableName: 'types', createdAt: false, updatedAt: false})
export class Types extends Model<Types>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 'type', description: 'Entity type name'})
  @Column({type: DataType.STRING, allowNull: false, defaultValue: 'type'})
  entityType: string;

  @ApiProperty({example: '1.1.1', description: 'Unique code'})
  @Column({type: DataType.STRING, allowNull: false})
  code: string;

  @ApiProperty({description: 'Custom identification number'})
  @Column({type: DataType.INTEGER, allowNull: true})
  number: number;

  @ApiProperty({example: 'Type 1', description: 'Type name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @ApiProperty({example: 'BALANCE SHEET', description: 'Has one of two meanings "BALANCE SHEET" or "INCOME STATEMENT"'})
  @Column({type: DataType.ENUM({values: ['BALANCE SHEET', 'INCOME STATEMENT']}), allowNull: false})
  finDocName: string;

  @ApiProperty({example: '1', description: 'Serial number'})
  @Column({type: DataType.STRING, allowNull: false})
  sortOrder: number;

  @ApiProperty({example: 'DR', description: 'Has one of two meanings "DR" or "CR"'})
  @Column({type: DataType.ENUM({values: ['DR', 'CR']}), allowNull: false})
  DRCRCode: string;

  @Column({type: DataType.STRING, allowNull: false})
  filePath: string;

  @HasMany(()=> Classes)
  classes!: Classes[];

  @HasMany(() => TaxType)
  taxType!: TaxType[]
}