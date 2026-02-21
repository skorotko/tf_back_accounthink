import {Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface CreateXeroAttrs {
    companyId: number;
    clientIdKey: string;
    clientSecretKey: string;
}

@Table({tableName: 'xero', createdAt: false, updatedAt: false})
export class Xero extends Model<Xero, CreateXeroAttrs> {

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 1, description: 'Unique identification number'})
    @Column({type: DataType.INTEGER, allowNull: false})
    companyId: number;

    @ApiProperty({example: '12312312', description: 'key clientId in zero'})
    @Column({type: DataType.STRING, allowNull: false})
    clientIdKey: string;

    @ApiProperty({ example: '12312312', description: 'key client secret in zero' })
    @Column({ type: DataType.STRING, allowNull: false })
    clientSecretKey: string;

    @ApiProperty({ example: '12312312', description: 'key id token in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    id_token: string;

    @ApiProperty({ example: '12312312', description: 'key access token in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    access_token: string;

    @ApiProperty({ example: '12312312', description: 'time expiresAt in zero' })
    @Column({ type: DataType.INTEGER, allowNull: true })
    expires_at: number;

    @ApiProperty({ example: '12312312', description: 'token type in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    token_type: string;

    @ApiProperty({ example: '12312312', description: 'refresh token in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    refresh_token: string;

    @ApiProperty({ example: '12312312', description: 'scope in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    scope: string;

    @ApiProperty({ example: '12312312', description: 'sessionState in zero' })
    @Column({ type: DataType.TEXT, allowNull: true })
    session_state: string;

    @Column(DataType.VIRTUAL)
    get tokenSet() {
        const id_token = this.getDataValue('id_token');
        const access_token = this.getDataValue('access_token');
        const expires_at = this.getDataValue('expires_at');
        const token_type = this.getDataValue('token_type');
        const refresh_token = this.getDataValue('refresh_token');
        const scope = this.getDataValue('scope');
        const session_state = this.getDataValue('session_state');
        return {
            id_token,
            access_token,
            expires_at,
            token_type,
            refresh_token,
            scope,
            session_state
        }
    }
}

