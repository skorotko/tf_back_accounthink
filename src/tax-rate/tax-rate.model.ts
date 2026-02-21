import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { SaleTax } from "../sale-tax/sale-tax.model";
import { WithHoldingTax } from "../with-holding-tax/with-holding-tax.model";

interface CreateTaxRateAttrs {
    saleTaxId?: number;
    withHoldingTaxId?: number;
    rate: number;
    financeYear: Date;
}

@Table({tableName: 'taxRate', createdAt: true, updatedAt: true})
export class TaxRate extends Model<TaxRate, CreateTaxRateAttrs>{

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 1, description: 'Tax id'})
    @ForeignKey(() => SaleTax)
    @Column({type: DataType.INTEGER, allowNull: true, defaultValue: null})
    saleTaxId: number;

    @ApiProperty({example: 1, description: 'Tax id'})
    @ForeignKey(() => WithHoldingTax)
    @Column({type: DataType.INTEGER, allowNull: true, defaultValue: null})
    withHoldingTaxId: number;

    @ApiProperty({example: 10})
    @Column({type: DataType.FLOAT(10,2), allowNull: false})
    rate: number;

    @ApiProperty({example: '25/07/2022', description: 'Finance Year'})
    @Column({type: DataType.DATE, allowNull: false})
    financeYear: Date;

    @BelongsTo(() => SaleTax)
    saleTax: SaleTax;

    @BelongsTo(() => WithHoldingTax)
    withHoldingTax: WithHoldingTax
}
