import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Warehouse } from 'src/warehouse/warehouse.model';
import { Transaction } from 'src/transaction/transaction.model';
import { ItemsOpenBalancesDetails } from './items-open-balances-details.model';

interface ItemsOpenBalancesHeaderCreateAttr {
  warehouseId: number,
  referenceNo: string,
  description: string,
  date: Date,
  tranId: number,
  companyId: number,
  createdBy: number,
  currency: string,
  totalAmount: number;
}

@Table({tableName: 'items-open-balances-header', createdAt: false, updatedAt: false})
export class ItemsOpenBalancesHeader extends Model<ItemsOpenBalancesHeader, ItemsOpenBalancesHeaderCreateAttr> {
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Warehouse)
  @Column({ type: DataType.INTEGER, allowNull: true })
  warehouseId: number;

  @ApiProperty({ example: 'Inventory', description: 'referenceNo' })
  @Column({ type: DataType.STRING, allowNull: true })
  referenceNo: string;

  @ApiProperty({ example: 'Inventory', description: '' })
  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @ApiProperty({ example: 'Currency', description: '' })
  @Column({ type: DataType.TEXT, allowNull: true })
  currency: string;

  @ApiProperty({ example: '1', description: 'totalAmount' })
  @Column({ type: DataType.FLOAT, allowNull: true, defaultValue: 0 })
  set totalAmount(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value))
      value = 0;
    this.setDataValue('totalAmount', Number((value).toFixed(8)));
  }

  @ApiProperty({ example: '08.08.2021', description: 'date' })
  @Column({ type: DataType.DATE, allowNull: true })
  date: Date;

  @ApiProperty({ example: '1', description: 'transaction journal id number' })
  @ForeignKey(() => Transaction)
  @Column({ type: DataType.INTEGER, allowNull: true })
  tranId: number;

  @ApiProperty({ example: '1', description: 'current company id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number;

  @ApiProperty({ example: '1', description: 'user id number who added' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'date created' })
  @Column({ type: DataType.DATE, allowNull: true })
  @CreatedAt
  createDate: Date;

  @ApiProperty({ example: '1', description: 'user id number who update' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  updateDatedBy: number;

  @ApiProperty({ example: '08.08.2021', description: 'date updated' })
  @Column({ type: DataType.DATE, allowNull: true })
  @UpdatedAt
  updateDate: Date;
 
  @BelongsTo(() => Transaction)
  transaction: Transaction;

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse;

  @HasMany(() => ItemsOpenBalancesDetails, 'itemOBHId')
  itemsOBDList: ItemsOpenBalancesDetails[]
  
}