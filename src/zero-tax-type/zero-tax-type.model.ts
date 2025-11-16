import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface ZeroTaxTypeCreateAttrs {
  name: string;
}

@Table({tableName: 'zeroTaxType', createdAt: false, updatedAt: false})
export class ZeroTaxType extends Model<ZeroTaxType, ZeroTaxTypeCreateAttrs> {

  @ApiProperty({example: 1, description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 'Name', description: 'Name'})
  @Column({type: DataType.STRING, allowNull: false})
  name: string;
}