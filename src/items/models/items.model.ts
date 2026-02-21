import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { ItemsType } from "./items-type.model";
import { ItemsUnits } from "../../items-units/items-units.model";
import { ItemsGroup } from "./items-group.model";
import { Account } from "../../account/account.model";
import { ItemsWarehouse } from "./items-warehouse.model";
import { Warehouse } from "../../warehouse/warehouse.model";
import {ItemsTransaction} from "./items-transaction.model";

interface ItemsCreateAttr {
  companyId: number;
  // vendorId: number;
  name: string;
  code: string;
  itemsTypeId: number;
  unitId: number;
  inventoryAssetAccountId: number;
  purchase: boolean;
  reorderQtyMin: number,
  purchasePrice: number;
  purchaseAccountId: number;
  purchaseTaxAccountId: number;
  purchaseDescription?: string;
  sell: boolean;
  reorderQtyMax: number,
  sellPrice: number;
  sellAccountId: number;
  sellTaxAccountId: number;
  sellDescription?: string;
}

@Table({tableName: 'items', createdAt: true, updatedAt: true})
export class Items extends Model<Items, ItemsCreateAttr> {
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  // @Column({type: DataType.INTEGER, allowNull: true})
  // vendorId: number;

  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: true})
  active: boolean;

  @Column({type: DataType.STRING(100), allowNull: false})
  name: string;

  @Column({type: DataType.STRING(50), allowNull: false})
  code: string;

  @ForeignKey(() => ItemsType)
  @Column({type: DataType.INTEGER, allowNull: true})
  itemsTypeId: number;

  @ForeignKey(() => ItemsUnits)
  @Column({type: DataType.INTEGER, allowNull: true})
  unitId: number;

  @ForeignKey(() => Account)
  @Column({type: DataType.INTEGER, allowNull: true})
  inventoryAssetAccountId: number;

  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  purchase: boolean;

  @Column({type: DataType.INTEGER, allowNull: true})
  reorderQtyMin: number;

  @Column({
    type: DataType.DECIMAL(15, 8),
    allowNull: true,
    get: function (): number {
      let value = this.getDataValue('purchasePrice')
      return Number(value)
    }
  })
  purchasePrice: number;

  @ForeignKey(() => Account)
  @Column({type: DataType.INTEGER, allowNull: true})
  purchaseAccountId: number;

  @ForeignKey(() => Account)
  @Column({type: DataType.INTEGER, allowNull: true})
  purchaseTaxAccountId: number;

  @Column({type: DataType.TEXT(), allowNull: true})
  purchaseDescription?: string;

  @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
  sell: boolean;

  @Column({type: DataType.INTEGER, allowNull: true})
  reorderQtyMax: number;

  @Column({
    type: DataType.DECIMAL(15, 8),
    allowNull: true,
    get: function (): number {
      let value = this.getDataValue('sellPrice')
      return Number(value)
    }
  })
  sellPrice: number;

  @ForeignKey(() => Account)
  @Column({type: DataType.INTEGER, allowNull: true})
  sellAccountId: number;

  @ForeignKey(() => Account)
  @Column({type: DataType.INTEGER, allowNull: true})
  sellTaxAccountId: number;

  @Column({type: DataType.TEXT(), allowNull: false})
  sellDescription?: string;

  @BelongsTo(() => Account, 'inventoryAssetAccountId')
  inventoryAssetAccount: Account

  @BelongsTo(() => Account, 'purchaseAccountId')
  purchaseAccount: Account

  @BelongsTo(() => Account, 'purchaseTaxAccountId')
  purchaseTaxAccount: Account

  @BelongsTo(() => Account, 'sellAccountId')
  sellAccount: Account

  @BelongsTo(() => Account, 'sellTaxAccountId')
  sellTaxAccount: Account

  @BelongsTo(() => ItemsType)
  type: ItemsType;

  @BelongsTo(() => ItemsUnits)
  unit: ItemsUnits;

  @HasMany(() => ItemsGroup, 'parentItemId')
  itemsGroup: ItemsGroup

  @BelongsToMany(() => Warehouse, () => ItemsWarehouse)
  warehouse: Warehouse[]

  @HasMany(() => ItemsTransaction, 'itemId')
  transactions: ItemsTransaction[]
}