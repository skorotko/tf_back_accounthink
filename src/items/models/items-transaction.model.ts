import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Items } from "./items.model";
import { Warehouse } from 'src/warehouse/warehouse.model';

export enum ItemsTransactionType {
  Initiate = 'Initiate', 
  Buy = 'Buy', 
  Sell = 'Sell', 
  TransferF = 'Transfer_From', 
  TransferT = 'Transfer_To', 
  Stock = 'Stock',
  Count = 'Count', 
  Adjustment = 'Adjustment',
  ReturnS = 'Return_Sales',
  ReturnP = 'Return_Purchase'
}
interface ItemsTransactionCreateAttr {
  warehouseId: number;
  itemId: number;
  qty: number;
  description: string;
  topType: ItemsTransactionType;
  createdBy: number;
  createDate: Date;
}

@Table({tableName: 'itemsTransaction', createdAt: false, updatedAt: false})
export class ItemsTransaction extends Model<ItemsTransaction, ItemsTransactionCreateAttr> {
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

  @ApiProperty({ example: 'Inventory', description: '' })
  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @ApiProperty({ example: 1, description: 'Unique identification number' })
  @Column({ type: DataType.ENUM(
    ItemsTransactionType.Initiate, 
    ItemsTransactionType.Buy,
    ItemsTransactionType.Sell,
    ItemsTransactionType.TransferF,
    ItemsTransactionType.TransferT,
    ItemsTransactionType.Stock,
    ItemsTransactionType.Count,
    ItemsTransactionType.Adjustment,
    ItemsTransactionType.ReturnS,
    ItemsTransactionType.ReturnP
    ), allowNull: false })
  type: ItemsTransactionType;

  @ApiProperty({ example: '1', description: 'user id number who added' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'date created' })
  @Column({ type: DataType.DATE, allowNull: true })
  @CreatedAt
  createDate: Date;

  @BelongsTo(() => Warehouse, 'warehouseId')
  warehouse: Warehouse

  @BelongsTo(() => Items, 'itemId')
  item: Items
}