import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { SaleTax } from "../sale-tax/sale-tax.model";
import { WithHoldingTax } from "../with-holding-tax/with-holding-tax.model";
import { Types } from "../types/types.model";
import { Account } from "../account/account.model";

interface CreateTaxTypeAttrs {
    name: string;
}

export enum TaxTopLevelCategory {
    sale = 'Sales',
    withholding = 'WithHolding'
}

@Table({tableName: 'taxType', createdAt: false, updatedAt: false})
export class TaxType extends Model<TaxType, CreateTaxTypeAttrs> {

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.ENUM(TaxTopLevelCategory.sale, TaxTopLevelCategory.withholding), allowNull: false})
    topType: TaxTopLevelCategory;

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @ForeignKey(() => Types)
    @Column({type: DataType.INTEGER, allowNull: false})
    mainTypeId: number;

    @ApiProperty({example: 1})
    @ForeignKey(() => Account)
    @Column({type: DataType.INTEGER, allowNull: false})
    accountTypeID: number;

    @ApiProperty({example: 'Name', description: 'Name'})
    @Column({type: DataType.STRING, allowNull: false})
    name: string;

    @HasMany(() => SaleTax)
    saleTax!: SaleTax;

    @HasMany(() => WithHoldingTax)
    withHoldingTax!: WithHoldingTax;

    @BelongsTo(() => Types)
    type!: Types;

    @BelongsTo(() => Account)
    account!: Account
}
