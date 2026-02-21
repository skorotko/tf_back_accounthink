import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { TaxRate } from "../tax-rate/tax-rate.model";
import { TaxType } from "../tax-type/tax-type.model";
import { ZeroTaxType } from "../zero-tax-type/zero-tax-type.model";
import { BankAccount } from 'src/bank-account/bank-account.model';

interface SaleTaxCreateAttrs {
    countryId: number;
    typeId: number;
    name: string;
    code: string;
    viewCode: string;
    description?: string;
}

@Table({tableName: 'saleTax', createdAt: true, updatedAt: true}) 
export class SaleTax extends Model<SaleTax, SaleTaxCreateAttrs>{

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 1, description: 'Country id'})
    @Column({type: DataType.INTEGER, allowNull: true})
    countryId: number;

    @ApiProperty({example: 1})
    @ForeignKey(() => TaxType)
    @Column({type: DataType.INTEGER, allowNull: false})
    typeId: number;

    @ApiProperty({example: 1})
    @ForeignKey(() => ZeroTaxType)
    @Column({type: DataType.INTEGER, allowNull: false})
    taxTypeId: number;

    @ApiProperty({example: 'VAT 10', description: 'Unique code'})
    @Column({type: DataType.STRING(1000), allowNull: false})
    code: string;

    @ApiProperty({example: 'VAT 101', description: 'View code'})
    @Column({type: DataType.STRING(1000), allowNull: true})
    viewCode: string;

    @ApiProperty({example: 'Tax Name', description: 'Tax Name'})
    @Column({type: DataType.STRING, allowNull: false})
    name: string;

    @ApiProperty({example: true, description: 'Tax status'})
    @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: true})
    active: boolean;

    @ApiProperty({example: 'description', description: 'description'})
    @Column({type: DataType.STRING(1000), allowNull: true, defaultValue: null})
    description: string;

    @HasMany(() => TaxRate)
    rate: Array<TaxRate>;

    @BelongsTo(() => TaxType)
    type: TaxType;

    @BelongsTo(() => ZeroTaxType)
    taxType: ZeroTaxType;

    @HasOne(() => BankAccount)
    bankAccount: BankAccount;
}
