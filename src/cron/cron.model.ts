import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface CronCreateAttrs {
  entityId: number;
  entityTypeId: number;
  description: string;
  cronDate: string;
}

@Table({tableName: 'cron', createdAt: false, updatedAt: false})
export class Cron extends Model<Cron, CronCreateAttrs>{

  @ApiProperty({example: '1', description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: '1', description: 'Unique type entity id'})
  @Column({ type: DataType.INTEGER, allowNull: false })
  entityTypeId: number;

  @ApiProperty({example: '1', description: 'Entity id'})
  @Column({ type: DataType.INTEGER, allowNull: false })
  entityId: number;

  @ApiProperty({ example: '25/07/2022', description: 'Date cron implaminatation' })
  @Column({ type: DataType.DATE, allowNull: false })
  cronDate: Date;

  @ApiProperty({example: 'Test cron', description: 'Description cron'})
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;
}
