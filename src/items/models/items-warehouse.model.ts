import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Items } from "./items.model";
import { Warehouse } from 'src/warehouse/warehouse.model';

interface ItemsWarehouseCreateAttr {
  warehouseId: number;
  itemId: number;
  qty: number;
}

@Table({tableName: 'itemsWarehouse', createdAt: false, updatedAt: false})
export class ItemsWarehouse extends Model<ItemsWarehouse, ItemsWarehouseCreateAttr> {
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Warehouse)
  @Column({type: DataType.INTEGER, allowNull: false})
  warehouseId: number;

  @ForeignKey(() => Items)
  @Column({type: DataType.INTEGER, allowNull: false})
  itemId: number;

  @Column({type: DataType.INTEGER, allowNull: false})
  qty: number;

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse

  @BelongsTo(() => Items)
  item: Items
}