import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { ItemsCategoryGroup } from 'src/items-category-group/items-category-group.model';

interface ItemsCategoriesCreateAttrs {
	companyId: number;
	groupId: number;
	parentId: number;
	name: string;
	code: string;
}

@Table({ tableName: 'itemsCategories', createdAt: true, updatedAt: true })
export class ItemsCategories extends Model<ItemsCategories, ItemsCategoriesCreateAttrs>{

	@ApiProperty({ example: 1, description: 'Unique identification number' })
	@Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
	id: number;

	@ApiProperty({ example: 1, description: 'Company id' })
	@Column({ type: DataType.INTEGER, allowNull: false })
	companyId: number;

	@ApiProperty({ example: 1, description: 'groupId' })
	@ForeignKey(() => ItemsCategoryGroup)
	@Column({ type: DataType.INTEGER, allowNull: false })
	groupId: number;

	@ApiProperty({ example: 1, description: 'parentId' })
	@ForeignKey(() => ItemsCategories)
	@Column({ type: DataType.INTEGER, allowNull: true })
	parentId: number;

	@ApiProperty({ example: 'VAT 10', description: 'Unique code' })
	@Column({ type: DataType.STRING(1000), allowNull: false })
	code: string;

	@ApiProperty({ example: 'Tax Name', description: 'Tax Name' })
	@Column({ type: DataType.STRING, allowNull: false })
	name: string;

	@Column(DataType.VIRTUAL)
	get createdAtMil() {
		return Date.parse(this.getDataValue('createdAt'));
	}

	@Column(DataType.VIRTUAL)
	get updatedAtMil() {
		return Date.parse(this.getDataValue('updatedAt'));
	}

	@BelongsTo(() => ItemsCategoryGroup)
	group: ItemsCategoryGroup;
	
	@HasMany(() => ItemsCategories)
	children: ItemsCategories;
}