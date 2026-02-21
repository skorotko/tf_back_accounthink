import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { ItemsWarehouse } from "../items/models/items-warehouse.model";
import { Items } from "../items/models/items.model";

interface WarehouseCreateAttr {
  companyId: number;
  warehouseCode: string;
  warehouseName: string;
  managerId: number;
  address?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  buId: number;
  projectId?: number;
  system?: boolean
}

@Table({tableName: 'warehouse', createdAt: true, updatedAt: true})
export class Warehouse extends Model<Warehouse, WarehouseCreateAttr>{
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({description: 'Company identification number'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({example: 'Any string', description: 'Warehouse code'})
  @Column({type: DataType.STRING, allowNull: false})
  warehouseCode: string;

  @ApiProperty({example: 'Any string', description: 'Warehouse name'})
  @Column({type: DataType.STRING, allowNull: false})
  warehouseName: string;

  @ApiProperty({description: 'managerId identification number'})
  @Column({type: DataType.INTEGER, allowNull: false})
  managerId: number;

  @ApiProperty({example: 'Address', description: 'Warehouse address'})
  @Column({type: DataType.STRING, allowNull: true, defaultValue: null})
  address: string;

  @ApiProperty({example: '+12345667788', description: 'Phone number'})
  @Column({type: DataType.STRING, allowNull: true, defaultValue: null})
  phone: string;

  @ApiProperty({example: '12345667788', description: 'Phone number'})
  @Column({type: DataType.STRING, allowNull: true, defaultValue: null})
  phone2: string;

  @ApiProperty({example: 'test@test.com', description: 'Email address'})
  @Column({type: DataType.STRING, allowNull: true, defaultValue: null})
  email: string;

  @ApiProperty({example: '1', description: 'Business Unit identification number'})
  @Column({type: DataType.INTEGER, allowNull: false})
  buId: number;

  @ApiProperty({example: '1', description: 'Project identification number'})
  @Column({type: DataType.INTEGER, allowNull: true, defaultValue: null})
  projectId: number;

  @ApiProperty({example: false, description: 'identification field system or not warehouse'})
  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  system: boolean;

  @BelongsToMany(() => Items, () => ItemsWarehouse)
  items: Items[]
}