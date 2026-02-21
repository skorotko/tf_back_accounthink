import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface ItemsTypeCreateAttr {
  name: string;
}

@Table({tableName: 'itemsType', createdAt: false, updatedAt: false})
export class ItemsType extends Model<ItemsType, ItemsTypeCreateAttr> {
  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING(255), allowNull: false})
  name: string;

  @Column({type: DataType.INTEGER, allowNull: false})
  group: number;
}