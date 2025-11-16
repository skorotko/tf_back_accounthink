import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { ItemsCategories } from 'src/items-categories/items-categories.model';

interface ItemsCategoryGroupCreateAttrs {
	companyId: number;
	name: string;
	code: string;
}

@Table({ tableName: 'itemsCategoryGroups', createdAt: true, updatedAt: true })
export class ItemsCategoryGroup extends Model<ItemsCategoryGroup, ItemsCategoryGroupCreateAttrs>{

	@ApiProperty({ example: 1, description: 'Unique identification number' })
	@Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
	id: number;

	@ApiProperty({ example: 1, description: 'Company id' })
	@Column({ type: DataType.INTEGER, allowNull: false })
	companyId: number;

	@ApiProperty({ example: 'VAT 10', description: 'Unique code' })
	@Column({ type: DataType.STRING(1000), allowNull: false })
	code: string;

	@ApiProperty({ example: 'Tax Name', description: 'Tax Name' })
	@Column({ type: DataType.STRING, allowNull: false })
	name: string;

	@HasMany(() => ItemsCategories)
	categories: ItemsCategories[];
}