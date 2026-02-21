import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface ItemsContactsCreateAttrs {
  companyId: number;
  xeroItemId: string;
  xeroClientId: string;
  partNumber: string;
  price: number;
  currencyId: number;
}

@Table({ tableName: 'itemsContacts', createdAt: true, updatedAt: true })
export class ItemsContacts extends Model<ItemsContacts, ItemsContactsCreateAttrs>{

  @ApiProperty({example: 1, description: 'Unique identification number'})
  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ApiProperty({example: 1, description: 'Company id'})
  @Column({type: DataType.INTEGER, allowNull: false})
  companyId: number;

  @ApiProperty({ example: 1, description: 'xero item Id' })
  @Column({ type: DataType.STRING, allowNull: false })
  xeroItemId: string;

  @ApiProperty({ example: 1, description: 'client Id' })
  @Column({ type: DataType.STRING, allowNull: false })
  xeroClientId: string;

  @ApiProperty({ example: 'partNumber', description: 'partNumber'})
  @Column({type: DataType.STRING, allowNull: true})
  partNumber: string;

  @ApiProperty({ example: 'Tax Name', description: 'Tax Name' })
  @Column({ type: DataType.FLOAT, allowNull: true })
  price: number;

  @ApiProperty({ example: 1, description: 'currencyId' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  currencyId: number;
}
