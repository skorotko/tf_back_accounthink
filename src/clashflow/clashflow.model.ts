import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Group } from "../group/group.model";

interface ClashflowCreateAttrs {
  name: string;
}

@Table({tableName: 'clashflows', createdAt: false, updatedAt: false})
export class Clashflow extends Model<Clashflow, ClashflowCreateAttrs>{
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
  id: number;

  // @ApiProperty({example: '1', description: 'Unique company identification number'})
  // @Column({type: DataType.INTEGER, allowNull: false})
  // companyId: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  // @ApiProperty({example: 'false', description: 'Standard clashflow identifier'})
  // @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
  // default: boolean;

  @HasMany(()=> Group)
  groups: Group[]
}
