import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Items } from "./items.model";

interface ItemsGroupCreateAttr {
  parentItemId: number;
  itemId: number;
  count: number;
  purchaseTotal: number;
  sellTotal: number;
}

@Table({tableName: 'itemsGroup', createdAt: false, updatedAt: false})
export class ItemsGroup extends Model<ItemsGroup, ItemsGroupCreateAttr> {
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Items)
  @Column({type: DataType.INTEGER, allowNull: false})
  parentItemId: number;

  @ForeignKey(() => Items)
  @Column({type: DataType.INTEGER, allowNull: false})
  itemId: number;

  @Column({type: DataType.INTEGER, allowNull: false})
  count: number;

  @Column({
    type: DataType.DECIMAL(15, 8),
    allowNull: true,
    get: function (): number {
      let value = this.getDataValue('purchaseTotal')
      return Number(value)
    }
  })
  purchaseTotal: number;

  @Column({
    type: DataType.DECIMAL(15, 8),
    allowNull: true,
    get: function (): number {
      let value = this.getDataValue('sellTotal')
      return Number(value)
    }
  })
  sellTotal: number;

  @BelongsTo(() => Items, 'parentItemId')
  parentItem: Items

  @BelongsTo(() => Items, 'itemId')
  item: Items
}