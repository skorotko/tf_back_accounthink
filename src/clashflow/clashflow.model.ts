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

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @HasMany(()=> Group)
  groups: Group[]
}
