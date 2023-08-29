// Core
import { Model, Table, Column, DataType } from 'sequelize-typescript'

@Table({
    timestamps: false
})
export class Group extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true })
    id: number;
    
    @Column({ type: DataType.STRING, unique: false })
    name: string;
}