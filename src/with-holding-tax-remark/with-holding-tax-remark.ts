import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface WithHoldingTaxRemarkCreateAttrs {
    name: string;
}

@Table({tableName: 'withHoldingTaxRemark', createdAt: false, updatedAt: false})
export class WithHoldingTaxRemark extends Model<WithHoldingTaxRemark, WithHoldingTaxRemarkCreateAttrs> {
    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'Name', description: 'Name'})
    @Column({type: DataType.STRING, allowNull: false})
    name: string;
}
