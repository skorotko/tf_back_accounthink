import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface ItemsUnitsCreateAttrs {
  companyId: number;
  name: string;
  code: string;
}

@Table({ tableName: 'itemsUnits', createdAt: true, updatedAt: true })
export class ItemsUnits extends Model<ItemsUnits, ItemsUnitsCreateAttrs>{

  @ApiProperty({example: 1, description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 1, description: 'Company id'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({description: 'Unique code'})
  @Column({type: DataType.STRING(1000), allowNull: false})
  code: string;

  @ApiProperty({example: 'Name', description: 'Name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;
}
