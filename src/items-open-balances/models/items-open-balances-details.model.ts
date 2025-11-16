import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Warehouse } from 'src/warehouse/warehouse.model';
import { Items } from 'src/items/models/items.model';
import { ItemsOpenBalancesHeader } from './items-open-balances-header.model';

interface ItemsOpenBalancesDetailsCreateAttr {
  qty: number,
  costPrice: number,
  itemId: number,
  warehouseId: number,
  companyId: number,
  vendorId: number,
  createdBy: number,
  itemOBHId: number;
}

@Table({ tableName: 'items-open-balances-detail', createdAt: false, updatedAt: false })
export class ItemsOpenBalancesDetails extends Model<ItemsOpenBalancesDetails, ItemsOpenBalancesDetailsCreateAttr> {
  @ApiProperty({ example: '1', description: 'Unique identification number' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: '1', description: 'quantity' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  qty: number;

  @ApiProperty({ example: '1', description: 'cost price' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  set costPrice(value: number) {
    if (!(typeof value === 'number') && !Number.isNaN(value))
      value = 0;
    this.setDataValue('costPrice', Number((value).toFixed(8)));
  }

  @Column(DataType.VIRTUAL)
  get total() {
    const costPrice = this.getDataValue('costPrice');
    const qty = this.getDataValue('qty');
    const total = costPrice * qty;
    return Number((total).toFixed(8));
  }

  @ForeignKey(() => Items)
  @Column({ type: DataType.INTEGER, allowNull: true })
  itemId: number;

  @ForeignKey(() => ItemsOpenBalancesHeader)
  @Column({ type: DataType.INTEGER, allowNull: true })
  itemOBHId: number;

  @ForeignKey(() => Warehouse)
  @Column({ type: DataType.INTEGER, allowNull: true })
  warehouseId: number;

  @ApiProperty({ example: '1', description: 'current company id' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  companyId: number
  
  @Column({ type: DataType.INTEGER, allowNull: true })
  vendorId: number;

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

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse;

  @BelongsTo(() => Items)
  item: Items

  @BelongsTo(() => ItemsOpenBalancesHeader)
  itemOBH: ItemsOpenBalancesHeader
}