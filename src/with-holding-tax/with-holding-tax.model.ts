import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { TaxType } from "../tax-type/tax-type.model";
import { TaxRate } from "../tax-rate/tax-rate.model";
import { WithHoldingTaxRemark } from "../with-holding-tax-remark/with-holding-tax-remark";

interface WithHoldingTaxCreateAttrs {
    countryId: number;
    typeId: number;
    name: string;
    code: string;
    viewCode: string;
    remarkId: number;
    description?: string;
}

@Table({tableName: 'withHoldingTax', createdAt: true, updatedAt: true})
export class WithHoldingTax extends Model<WithHoldingTax, WithHoldingTaxCreateAttrs> {
    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @ForeignKey(() => TaxType)
    @Column({type: DataType.INTEGER, allowNull: false})
    typeId: number;

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @ForeignKey(() => TaxType)
    @Column({type: DataType.INTEGER, allowNull: false})
    countryId: number;

    @ApiProperty({example: 'Name', description: 'Name'})
    @Column({type: DataType.STRING(1000), allowNull: false})
    name: string;

    @ApiProperty({example: 'Code', description: 'VV10%'})
    @Column({type: DataType.STRING, allowNull: false})
    code: string;

    @ApiProperty({example: 'VAT 101', description: 'View code'})
    @Column({type: DataType.STRING(1000), allowNull: true})
    viewCode: string;

    @ApiProperty({example: true, description: 'Tax status'})
    @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: true})
    active: boolean;

    @ApiProperty({example: 'description', description: 'description'})
    @Column({type: DataType.STRING(1000), allowNull: true, defaultValue: null})
    description: string;

    @ApiProperty({})
    @ForeignKey(() => WithHoldingTaxRemark)
    @Column({type: DataType.INTEGER, allowNull: false})
    remarkId: number;

    @HasMany(() => TaxRate)
    rate: TaxRate[];

    @BelongsTo(() => TaxType)
    type: TaxType;

    @BelongsTo(() => WithHoldingTaxRemark)
    remark: WithHoldingTaxRemark;
}
